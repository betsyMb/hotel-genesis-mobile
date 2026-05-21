import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms, useReservations, useUsers, useOccupancies } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation, Room, User, Occupancy } from "@/hooks/api/types";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function AdminReportsScreen() {
  const { data: rooms } = useRooms();
  const { data: reservations } = useReservations();
  const { data: users } = useUsers();
  const { data: occupancies } = useOccupancies();

  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter((r) => r.room_status === "available").length || 0;
  const occupiedRooms = rooms?.filter((r) => r.room_status === "occupied").length || 0;
  const maintenanceRooms = rooms?.filter((r) => r.room_status === "maintenance").length || 0;
  const reservedRooms = rooms?.filter((r) => r.room_status === "reserved").length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  const totalReservations = reservations?.length || 0;
  const pendingReservations = reservations?.filter((r: Reservation) => r.reservation_status === "pending").length || 0;
  const confirmedReservations = reservations?.filter((r: Reservation) => r.reservation_status === "confirmed").length || 0;
  const completedReservations = reservations?.filter((r: Reservation) => r.reservation_status === "completed").length || 0;
  const cancelledReservations = reservations?.filter((r: Reservation) => r.reservation_status === "cancelled").length || 0;

  const totalRevenue = reservations
    ?.filter((r: Reservation) => r.reservation_status === "completed")
    .reduce((sum: number, r: Reservation) => sum + r.total_amount, 0) || 0;

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.is_active !== false).length || 0;
  const totalClients = users?.filter((u) => u.role === "Client").length || 0;

  const activeOccupancies = occupancies?.filter((o) => o.occupancy_status === "active").length || 0;
  const completedOccupancies = occupancies?.filter((o) => o.occupancy_status === "completed").length || 0;

  const roleCounts: Record<string, number> = {};
  users?.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  const roomTypeCounts: Record<string, { count: number; totalRevenue: number }> = {};
  rooms?.forEach((r: Room) => {
    if (!roomTypeCounts[r.room_type]) roomTypeCounts[r.room_type] = { count: 0, totalRevenue: 0 };
    roomTypeCounts[r.room_type].count++;
  });
  reservations
    ?.filter((r: Reservation) => r.reservation_status === "completed")
    .forEach((r: Reservation) => {
      const room = rooms?.find((rm) => rm.id_room === r.id_room);
      if (room && roomTypeCounts[room.room_type]) {
        roomTypeCounts[room.room_type].totalRevenue += r.total_amount;
      }
    });

  const generatePDF = async (title: string, htmlBody: string) => {
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1f2937; }
              h1 { font-size: 24px; margin-bottom: 4px; color: #111827; }
              .date { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
              td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
              .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
              .stat-label { color: #6b7280; }
              .stat-value { font-weight: 600; }
              .section-title { font-weight: 600; margin-top: 20px; margin-bottom: 8px; font-size: 14px; color: #111827; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
              .badge-green { background: #d1fae5; color: #065f46; }
              .badge-red { background: #fee2e2; color: #991b1b; }
              .badge-yellow { background: #fef3c7; color: #92400e; }
              .badge-blue { background: #dbeafe; color: #1e40af; }
              .badge-gray { background: #f3f4f6; color: #374151; }
              .badge-purple { background: #ede9fe; color: #5b21b6; }
              .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="date">Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            ${htmlBody}
            <div class="footer">Hotel Management System — Admin Report</div>
          </body>
        </html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Save ${title}`,
        });
      }
    } catch (err) {
      console.warn("PDF generation failed:", err);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: "badge-green",
      occupied: "badge-red",
      maintenance: "badge-yellow",
      reserved: "badge-purple",
      pending: "badge-yellow",
      confirmed: "badge-blue",
      completed: "badge-green",
      cancelled: "badge-gray",
      active: "badge-green",
      no_show: "badge-red",
    };
    const cls = map[status] || "badge-gray";
    return `<span class="badge ${cls}">${status}</span>`;
  };

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-4 pb-8">
        <ThemedText type="title" className="mb-1">Reports</ThemedText>
        <ThemedText className="opacity-60 mb-6">Dashboard overview & exportable reports</ThemedText>

        {/* Report 1: Occupancy */}
        <ReportSection
          title="Occupancy Report"
          icon="hotel"
          iconBg="#0EA5E9"
          onDownload={() =>
            generatePDF(
              "Occupancy Report",
              `<div class="section-title">Summary</div>
               <div class="stat-row"><span class="stat-label">Total Rooms</span><span class="stat-value">${totalRooms}</span></div>
               <div class="stat-row"><span class="stat-label">Available</span><span class="stat-value">${availableRooms}</span></div>
               <div class="stat-row"><span class="stat-label">Occupied</span><span class="stat-value">${occupiedRooms}</span></div>
               <div class="stat-row"><span class="stat-label">Under Maintenance</span><span class="stat-value">${maintenanceRooms}</span></div>
               <div class="stat-row"><span class="stat-label">Reserved</span><span class="stat-value">${reservedRooms}</span></div>
               <div class="stat-row"><span class="stat-label">Occupancy Rate</span><span class="stat-value">${occupancyRate}%</span></div>
               <div class="stat-row"><span class="stat-label">Active Stays</span><span class="stat-value">${activeOccupancies}</span></div>
               <div class="section-title">Room Details</div>
               <table>
                 <tr><th>Room</th><th>Floor</th><th>Type</th><th>Price/Night</th><th>Status</th></tr>
                 ${(rooms || [])
                   .sort((a: Room, b: Room) => a.room_number.localeCompare(b.room_number))
                   .map(
                     (r: Room) =>
                       `<tr>
                         <td>${r.room_number}</td>
                         <td>${r.floor}</td>
                         <td style="text-transform:capitalize">${r.room_type}</td>
                         <td>$${r.price_per_night}</td>
                         <td>${statusBadge(r.room_status)}</td>
                       </tr>`
                   )
                   .join("")}
               </table>
               <div class="section-title">Active Occupancies</div>
               <table>
                 <tr><th>Room</th><th>Check-In</th><th>Status</th></tr>
                 ${(occupancies || [])
                   .filter((o: Occupancy) => o.occupancy_status === "active")
                   .map(
                     (o: Occupancy) =>
                       `<tr>
                         <td>${o.room?.room_number || "—"}</td>
                         <td>${new Date(o.actual_check_in).toLocaleDateString()}</td>
                         <td>${statusBadge(o.occupancy_status)}</td>
                       </tr>`
                   )
                   .join("")}
               </table>`
            )
          }
        >
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="text-sm opacity-70">Occupancy Rate</ThemedText>
              <ThemedText className="text-lg font-bold text-[#0EA5E9]">{occupancyRate}%</ThemedText>
            </View>
            <View className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <View className="h-full rounded-full bg-[#0EA5E9]" style={{ width: `${occupancyRate}%` }} />
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-3">
            <StatusPill label="Available" value={availableRooms} color="#10B981" />
            <StatusPill label="Occupied" value={occupiedRooms} color="#EF4444" />
            <StatusPill label="Maintenance" value={maintenanceRooms} color="#F59E0B" />
            <StatusPill label="Reserved" value={reservedRooms} color="#8B5CF6" />
            <StatusPill label="Active Stays" value={activeOccupancies} color="#3B82F6" />
          </View>
          <CollapsibleList label="Room Details">
            {(rooms || [])
              .sort((a: Room, b: Room) => a.room_number.localeCompare(b.room_number))
              .map((r: Room) => (
                <View key={r.id_room} className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <View className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 items-center justify-center mr-3">
                    <ThemedText className="text-sm font-bold">{r.room_number}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <ThemedText className="text-sm font-medium capitalize">{r.room_type}</ThemedText>
                      <View className="w-1 h-1 rounded-full bg-gray-300" />
                      <ThemedText className="text-xs opacity-60">Floor {r.floor}</ThemedText>
                    </View>
                    <ThemedText className="text-xs opacity-60">${r.price_per_night}/night</ThemedText>
                  </View>
                  <RoomStatusBadge status={r.room_status} />
                </View>
              ))}
          </CollapsibleList>
        </ReportSection>

        {/* Report 2: Revenue */}
        <ReportSection
          title="Revenue Report"
          icon="attach-money"
          iconBg="#8B5CF6"
          onDownload={() =>
            generatePDF(
              "Revenue Report",
              `<div class="section-title">Summary</div>
               <div class="stat-row"><span class="stat-label">Total Revenue (Completed)</span><span class="stat-value">$${totalRevenue.toLocaleString()}</span></div>
               <div class="stat-row"><span class="stat-label">Completed Reservations</span><span class="stat-value">${completedReservations}</span></div>
               <div class="stat-row"><span class="stat-label">Avg. Revenue per Booking</span><span class="stat-value">$${completedReservations > 0 ? Math.round(totalRevenue / completedReservations).toLocaleString() : 0}</span></div>
               <div class="stat-row"><span class="stat-label">Pending Revenue</span><span class="stat-value">$${(reservations || []).filter((r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed").reduce((s: number, r: Reservation) => s + r.total_amount, 0).toLocaleString()}</span></div>
               <div class="section-title">Revenue by Room Type</div>
               ${Object.entries(roomTypeCounts)
                 .map(
                   ([type, data]) =>
                     `<div class="stat-row"><span class="stat-label" style="text-transform:capitalize">${type}</span><span class="stat-value">$${data.totalRevenue.toLocaleString()} (${data.count} rooms)</span></div>`
                 )
                 .join("")}
               <div class="section-title">Completed Transactions</div>
               <table>
                 <tr><th>Client</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Amount</th></tr>
                 ${(reservations || [])
                   .filter((r: Reservation) => r.reservation_status === "completed")
                   .sort((a: Reservation, b: Reservation) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime())
                   .map(
                     (r: Reservation) =>
                       `<tr>
                         <td>${r.client?.full_name || "—"}</td>
                         <td>${r.room?.room_number || "—"}</td>
                         <td>${new Date(r.check_in_date).toLocaleDateString()}</td>
                         <td>${new Date(r.check_out_date).toLocaleDateString()}</td>
                         <td><strong>$${r.total_amount.toLocaleString()}</strong></td>
                       </tr>`
                   )
                   .join("")}
               </table>`
            )
          }
        >
          <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
            <ThemedText className="text-sm opacity-70">Total Revenue (Completed)</ThemedText>
            <ThemedText className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              ${totalRevenue.toLocaleString()}
            </ThemedText>
          </View>
          <View className="flex-row gap-3 mb-3">
            <ReportCard icon="check-circle" label="Completed" value={completedReservations} color="#10B981" />
            <ReportCard icon="trending-up" label="Avg / Booking" value={completedReservations > 0 ? `$${Math.round(totalRevenue / completedReservations)}` : "$0"} color="#8B5CF6" />
            <ReportCard icon="pending" label="Pending" value={`$${(reservations || []).filter((r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed").reduce((s: number, r: Reservation) => s + r.total_amount, 0).toLocaleString()}`} color="#F59E0B" />
          </View>
          <CollapsibleList label="Completed Transactions">
            {(reservations || [])
              .filter((r: Reservation) => r.reservation_status === "completed")
              .sort((a: Reservation, b: Reservation) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime())
              .map((r: Reservation) => (
                <View key={r.id_reservation} className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <View className="flex-1">
                    <ThemedText className="text-sm font-medium">{r.client?.full_name || "—"}</ThemedText>
                    <ThemedText className="text-xs opacity-60">Rm {r.room?.room_number || "—"} · {new Date(r.check_in_date).toLocaleDateString()} → {new Date(r.check_out_date).toLocaleDateString()}</ThemedText>
                  </View>
                  <ThemedText className="text-sm font-bold text-green-600 dark:text-green-400">${r.total_amount.toLocaleString()}</ThemedText>
                </View>
              ))}
          </CollapsibleList>
        </ReportSection>

        {/* Report 3: Reservations */}
        <ReportSection
          title="Reservations Report"
          icon="event-note"
          iconBg="#F59E0B"
          onDownload={() =>
            generatePDF(
              "Reservations Report",
              `<div class="section-title">Summary</div>
               <div class="stat-row"><span class="stat-label">Total Reservations</span><span class="stat-value">${totalReservations}</span></div>
               <div class="stat-row"><span class="stat-label">Pending</span><span class="stat-value">${pendingReservations}</span></div>
               <div class="stat-row"><span class="stat-label">Confirmed</span><span class="stat-value">${confirmedReservations}</span></div>
               <div class="stat-row"><span class="stat-label">Completed</span><span class="stat-value">${completedReservations}</span></div>
               <div class="stat-row"><span class="stat-label">Cancelled</span><span class="stat-value">${cancelledReservations}</span></div>
               <table>
                 <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
                 <tr><td>Pending</td><td>${pendingReservations}</td><td>${totalReservations > 0 ? Math.round((pendingReservations / totalReservations) * 100) : 0}%</td></tr>
                 <tr><td>Confirmed</td><td>${confirmedReservations}</td><td>${totalReservations > 0 ? Math.round((confirmedReservations / totalReservations) * 100) : 0}%</td></tr>
                 <tr><td>Completed</td><td>${completedReservations}</td><td>${totalReservations > 0 ? Math.round((completedReservations / totalReservations) * 100) : 0}%</td></tr>
                 <tr><td>Cancelled</td><td>${cancelledReservations}</td><td>${totalReservations > 0 ? Math.round((cancelledReservations / totalReservations) * 100) : 0}%</td></tr>
               </table>
               <div class="section-title">All Reservations</div>
               <table>
                 <tr><th>Client</th><th>Email</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Amount</th><th>Status</th></tr>
                 ${(reservations || [])
                   .sort((a: Reservation, b: Reservation) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())
                   .map(
                     (r: Reservation) =>
                       `<tr>
                         <td>${r.client?.full_name || "—"}</td>
                         <td style="font-size:11px">${r.client?.email || "—"}</td>
                         <td>${r.room?.room_number || "—"}</td>
                         <td>${new Date(r.check_in_date).toLocaleDateString()}</td>
                         <td>${new Date(r.check_out_date).toLocaleDateString()}</td>
                         <td>$${r.total_amount.toLocaleString()}</td>
                         <td>${statusBadge(r.reservation_status)}</td>
                       </tr>`
                   )
                   .join("")}
               </table>`
            )
          }
        >
          <View className="flex-row gap-3 mb-4">
            <ReportCard icon="event" label="Total" value={totalReservations} color="#F59E0B" />
            <ReportCard icon="check-circle" label="Completed" value={completedReservations} color="#10B981" />
            <ReportCard icon="cancel" label="Cancelled" value={cancelledReservations} color="#6B7280" />
          </View>
          <View className="flex-row flex-wrap gap-2">
            <StatusPill label="Pending" value={pendingReservations} color="#F59E0B" />
            <StatusPill label="Confirmed" value={confirmedReservations} color="#10B981" />
            <StatusPill label="Completed" value={completedReservations} color="#3B82F6" />
            <StatusPill label="Cancelled" value={cancelledReservations} color="#6B7280" />
          </View>
          <CollapsibleList label="All Reservations">
            {(reservations || [])
              .sort((a: Reservation, b: Reservation) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())
              .map((r: Reservation) => (
                <View key={r.id_reservation} className="py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <ThemedText className="text-sm font-medium">{r.client?.full_name || "—"}</ThemedText>
                      <ThemedText className="text-xs opacity-60">{r.client?.email || "—"}</ThemedText>
                    </View>
                    <ReservationStatusBadge status={r.reservation_status} />
                  </View>
                  <View className="flex-row items-center gap-2 mt-1">
                    <MaterialIcons name="meeting-room" size={14} color="#9CA3AF" />
                    <ThemedText className="text-xs opacity-60">Rm {r.room?.room_number || "—"}</ThemedText>
                    <View className="w-1 h-1 rounded-full bg-gray-300" />
                    <MaterialIcons name="date-range" size={14} color="#9CA3AF" />
                    <ThemedText className="text-xs opacity-60">{new Date(r.check_in_date).toLocaleDateString()} → {new Date(r.check_out_date).toLocaleDateString()}</ThemedText>
                    <View className="flex-1" />
                    <ThemedText className="text-xs font-bold">${r.total_amount.toLocaleString()}</ThemedText>
                  </View>
                </View>
              ))}
          </CollapsibleList>
        </ReportSection>

        {/* Report 4: Users */}
        <ReportSection
          title="Users Report"
          icon="group"
          iconBg="#10B981"
          onDownload={() =>
            generatePDF(
              "Users Report",
              `<div class="section-title">Summary</div>
               <div class="stat-row"><span class="stat-label">Total Users</span><span class="stat-value">${totalUsers}</span></div>
               <div class="stat-row"><span class="stat-label">Active Users</span><span class="stat-value">${activeUsers}</span></div>
               <div class="stat-row"><span class="stat-label">Inactive Users</span><span class="stat-value">${totalUsers - activeUsers}</span></div>
               <div class="stat-row"><span class="stat-label">Clients</span><span class="stat-value">${totalClients}</span></div>
               <table>
                 <tr><th>Role</th><th>Count</th></tr>
                 ${["Administrator", "Manager", "Receptionist", "Client", "Maintenance"]
                   .map((role) => `<tr><td>${role}</td><td>${roleCounts[role] || 0}</td></tr>`)
                   .join("")}
               </table>
               <div class="section-title">All Users</div>
               <table>
                 <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr>
                 ${(users || [])
                   .sort((a: User, b: User) => a.full_name.localeCompare(b.full_name))
                   .map(
                     (u: User) =>
                       `<tr>
                         <td>${u.full_name}</td>
                         <td style="font-size:11px">${u.email}</td>
                         <td>${u.phone || "—"}</td>
                         <td>${u.role}</td>
                         <td>${u.is_active !== false ? statusBadge("active") : statusBadge("cancelled")}</td>
                       </tr>`
                   )
                   .join("")}
               </table>`
            )
          }
        >
          <View className="flex-row gap-3 mb-4">
            <ReportCard icon="people" label="Total" value={totalUsers} color="#10B981" />
            <ReportCard icon="check-circle" label="Active" value={activeUsers} color="#10B981" />
            <ReportCard icon="person" label="Clients" value={totalClients} color="#0EA5E9" />
          </View>
          <View className="border-t border-gray-100 dark:border-gray-700 pt-3">
            {["Administrator", "Manager", "Receptionist", "Client", "Maintenance"].map((role) => {
              const icons: Record<string, string> = {
                Administrator: "admin-panel-settings",
                Manager: "work",
                Receptionist: "reorder",
                Client: "person",
                Maintenance: "build",
              };
              const colors: Record<string, string> = {
                Administrator: "#EF4444",
                Manager: "#F59E0B",
                Receptionist: "#3B82F6",
                Client: "#10B981",
                Maintenance: "#6B7280",
              };
              return (
                <View key={role} className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <MaterialIcons name={icons[role] as any} size={18} color={colors[role]} />
                    <ThemedText className="ml-2 text-sm">{role}</ThemedText>
                  </View>
                  <ThemedText className="text-sm font-semibold">{roleCounts[role] || 0}</ThemedText>
                </View>
              );
            })}
          </View>
          <CollapsibleList label="All Users">
            {(users || [])
              .sort((a: User, b: User) => a.full_name.localeCompare(b.full_name))
              .map((u: User) => (
                <View key={u.id_user} className="flex-row items-center py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                    <ThemedText className="text-sm font-bold opacity-60">{u.full_name.charAt(0).toUpperCase()}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <ThemedText className="text-sm font-medium">{u.full_name}</ThemedText>
                      {u.is_active === false && (
                        <View className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30">
                          <ThemedText className="text-[10px] font-semibold text-red-600 dark:text-red-400">Inactive</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText className="text-xs opacity-60">{u.email} {u.phone ? `· ${u.phone}` : ""}</ThemedText>
                  </View>
                  <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: roleColors[u.role] + "15" }}>
                    <ThemedText className="text-[11px] font-semibold" style={{ color: roleColors[u.role] }}>{u.role}</ThemedText>
                  </View>
                </View>
              ))}
          </CollapsibleList>
        </ReportSection>

        {/* Report 5: Room Types */}
        <ReportSection
          title="Room Types Report"
          icon="layers"
          iconBg="#EC4899"
          onDownload={() =>
            generatePDF(
              "Room Types Report",
              `<div class="section-title">Summary by Type</div>
               <table>
                <tr><th>Room Type</th><th>Count</th><th>Revenue Generated</th><th>Avg Revenue / Room</th><th>Price Range</th></tr>
                ${Object.entries(roomTypeCounts)
                  .map(([type, data]) => {
                    const typeRooms = (rooms || []).filter((r: Room) => r.room_type === type);
                    const prices = typeRooms.map((r: Room) => r.price_per_night);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    return `<tr>
                      <td style="text-transform:capitalize">${type}</td>
                      <td>${data.count}</td>
                      <td>$${data.totalRevenue.toLocaleString()}</td>
                      <td>$${data.count > 0 ? Math.round(data.totalRevenue / data.count).toLocaleString() : 0}</td>
                      <td>$${minPrice} — $${maxPrice}</td>
                    </tr>`;
                  })
                  .join("")}
              </table>
              <div class="section-title">Rooms by Type</div>
              ${Object.entries(
                (rooms || []).reduce((acc: Record<string, Room[]>, r: Room) => {
                  if (!acc[r.room_type]) acc[r.room_type] = [];
                  acc[r.room_type].push(r);
                  return acc;
                }, {})
              )
                .map(
                  ([type, typeRooms]) =>
                    `<div style="margin-top:12px;font-weight:600;text-transform:capitalize">${type} (${typeRooms.length})</div>
                     <table>
                       <tr><th>Room</th><th>Floor</th><th>Capacity</th><th>Price/Night</th><th>Status</th></tr>
                       ${typeRooms
                         .map(
                           (r: Room) =>
                             `<tr>
                               <td>${r.room_number}</td>
                               <td>${r.floor}</td>
                               <td>${r.capacity || "—"}</td>
                               <td>$${r.price_per_night}</td>
                               <td>${statusBadge(r.room_status)}</td>
                             </tr>`
                         )
                         .join("")}
                     </table>`
                )
                .join("")}
              <div class="section-title">Totals</div>
              <div class="stat-row"><span class="stat-label">Total Completed Check-Outs</span><span class="stat-value">${completedOccupancies}</span></div>
              <div class="stat-row"><span class="stat-label">Total Rooms</span><span class="stat-value">${totalRooms}</span></div>`
            )
          }
        >
          <View className="flex-row gap-3 mb-4">
            <ReportCard icon="hotel" label="Room Types" value={Object.keys(roomTypeCounts).length} color="#EC4899" />
            <ReportCard icon="attach-money" label="Total Revenue" value={`$${Object.values(roomTypeCounts).reduce((s, d) => s + d.totalRevenue, 0).toLocaleString()}`} color="#10B981" />
            <ReportCard icon="repeat" label="Check-outs" value={completedOccupancies} color="#3B82F6" />
          </View>
          {(["simple", "double", "suite", "family"] as const).map((type) => {
            const typeRooms = (rooms || []).filter((r: Room) => r.room_type === type);
            if (typeRooms.length === 0) return null;
            const data = roomTypeCounts[type] || { count: 0, totalRevenue: 0 };
            return (
              <View key={type} className="mb-3">
                <View className="flex-row justify-between items-center py-2">
                  <ThemedText className="text-sm capitalize font-medium">{type}</ThemedText>
                  <View className="items-end">
                    <ThemedText className="text-xs opacity-60">{data.count} room{data.count !== 1 ? "s" : ""}</ThemedText>
                    <ThemedText className="text-xs font-semibold text-green-600 dark:text-green-400">${data.totalRevenue.toLocaleString()}</ThemedText>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-1.5">
                  {typeRooms.map((r: Room) => (
                    <View
                      key={r.id_room}
                      className="px-2.5 py-1.5 rounded-lg flex-row items-center gap-1.5"
                      style={{ backgroundColor: roomStatusBg[r.room_status] }}
                    >
                      <ThemedText className="text-xs font-semibold">{r.room_number}</ThemedText>
                      <View className="w-1 h-1 rounded-full" style={{ backgroundColor: roomStatusColor[r.room_status] }} />
                      <ThemedText className="text-[10px] opacity-60">${r.price_per_night}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ReportSection>
      </ThemedView>
    </ScrollView>
  );
}

const roleColors: Record<string, string> = {
  Administrator: "#EF4444",
  Manager: "#F59E0B",
  Receptionist: "#3B82F6",
  Client: "#10B981",
  Maintenance: "#6B7280",
};

const roomStatusColor: Record<string, string> = {
  available: "#10B981",
  occupied: "#EF4444",
  maintenance: "#F59E0B",
  reserved: "#8B5CF6",
};

const roomStatusBg: Record<string, string> = {
  available: "#10B98115",
  occupied: "#EF444415",
  maintenance: "#F59E0B15",
  reserved: "#8B5CF615",
};

function CollapsibleList({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
      <TouchableOpacity onPress={() => setOpen(!open)} className="flex-row items-center justify-between py-2">
        <ThemedText className="text-sm font-medium opacity-70">{label}</ThemedText>
        <MaterialIcons name={open ? "expand-less" : "expand-more"} size={20} color="#9CA3AF" />
      </TouchableOpacity>
      {open && children}
    </View>
  );
}

function RoomStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    available: "#10B981",
    occupied: "#EF4444",
    maintenance: "#F59E0B",
    reserved: "#8B5CF6",
  };
  return (
    <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: (colors[status] || "#6B7280") + "15" }}>
      <ThemedText className="text-[11px] font-semibold capitalize" style={{ color: colors[status] || "#6B7280" }}>{status}</ThemedText>
    </View>
  );
}

function ReservationStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    completed: "#10B981",
    cancelled: "#6B7280",
    no_show: "#EF4444",
  };
  return (
    <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: (colors[status] || "#6B7280") + "15" }}>
      <ThemedText className="text-[11px] font-semibold capitalize" style={{ color: colors[status] || "#6B7280" }}>{status}</ThemedText>
    </View>
  );
}

function ReportSection({
  title,
  icon,
  iconBg,
  children,
  onDownload,
}: {
  title: string;
  icon: string;
  iconBg: string;
  children: React.ReactNode;
  onDownload: () => void;
}) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-5">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${iconBg}15` }}>
            <MaterialIcons name={icon as any} size={22} color={iconBg} />
          </View>
          <ThemedText type="subtitle">{title}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={onDownload}
          className="flex-row items-center px-3 py-2 rounded-lg"
          style={{ backgroundColor: `${iconBg}15` }}
        >
          <MaterialIcons name="file-download" size={18} color={iconBg} />
          <ThemedText className="ml-1.5 text-xs font-semibold" style={{ color: iconBg }}>PDF</ThemedText>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function ReportCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center">
      <MaterialIcons name={icon as any} size={20} color={color} />
      <ThemedText className="text-lg font-bold mt-1" style={{ color }}>{value}</ThemedText>
      <ThemedText className="text-xs opacity-60">{label}</ThemedText>
    </View>
  );
}

function StatusPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-row items-center px-3 py-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
      <ThemedText className="text-sm opacity-70">{label}:</ThemedText>
      <ThemedText className="ml-1 text-sm font-bold" style={{ color }}>{value}</ThemedText>
    </View>
  );
}
