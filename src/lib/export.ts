import { jsPDF } from "jspdf";
import { utils, writeFile } from "xlsx";
import { format } from "date-fns";

import type { ReportTable } from "@/lib/reports";
import type { Match } from "@/mock/matches";
import { getMatchResult } from "@/mock/matches";
import type { Player } from "@/mock/players";
import type { ActiveTeam } from "@/store/onboarding-store";
import type { ResolvedBenchOfficial } from "@/lib/matches";
import { getFormationSlots, getStartingPlayerIds } from "@/lib/matches";
import { getInitials } from "@/lib/utils";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportCsv(table: ReportTable, filename: string) {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = table.columns.map((column) => escapeCell(column.label)).join(",");
  const rows = table.rows.map((row) =>
    table.columns.map((column) => escapeCell(row[column.key] ?? "")).join(",")
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportReportExcel(table: ReportTable, filename: string) {
  const data = table.rows.map((row) => {
    const record: Record<string, string> = {};
    for (const column of table.columns) {
      record[column.label] = row[column.key] ?? "";
    }
    return record;
  });
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Report");
  writeFile(workbook, `${filename}.xlsx`);
}

function truncateForColumn(text: string, colWidthMm: number): string {
  const maxChars = Math.max(4, Math.floor(colWidthMm / 1.8));
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

export function exportReportPdf(table: ReportTable, filename: string, title: string) {
  const doc = new jsPDF({ orientation: table.columns.length > 6 ? "landscape" : "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = usableWidth / table.columns.length;
  let y = margin;

  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${format(new Date(), "d MMM yyyy, HH:mm")}`, margin, y);
  y += 8;
  doc.setTextColor(0);

  function drawHeaderRow() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    table.columns.forEach((column, index) => {
      doc.text(truncateForColumn(column.label, colWidth), margin + index * colWidth, y);
    });
    y += 5;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
  }

  drawHeaderRow();

  for (const row of table.rows) {
    if (y > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeaderRow();
    }
    table.columns.forEach((column, index) => {
      doc.text(truncateForColumn(String(row[column.key] ?? ""), colWidth), margin + index * colWidth, y);
    });
    y += 6;
  }

  doc.save(`${filename}.pdf`);
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.includes("image/png")) return "PNG";
  if (dataUrl.includes("image/webp")) return "WEBP";
  return "JPEG";
}

function drawBadge(doc: jsPDF, x: number, y: number, size: number, initials: string, logo?: string) {
  if (logo) {
    try {
      doc.addImage(logo, getImageFormat(logo), x, y, size, size);
      return;
    } catch {
      // Falls through to the initials badge below if the image can't be decoded.
    }
  }
  doc.setFillColor(50, 50, 50);
  doc.circle(x + size / 2, y + size / 2, size / 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size / 2.2);
  doc.setTextColor(255, 255, 255);
  const textWidth = doc.getTextWidth(initials);
  doc.text(initials, x + size / 2 - textWidth / 2, y + size / 2 + size / 6);
}

export function exportLineupPdf(
  match: Match,
  team: ActiveTeam,
  players: Player[],
  benchOfficials: ResolvedBenchOfficial[]
) {
  if (!match.lineup) return;
  const lineup = match.lineup;
  const playerMap = new Map(players.map((player) => [player.id, player]));

  const doc = new jsPDF({ orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Match Lineup", margin, y);
  y += 10;

  const badgeSize = 16;
  const badgeY = y;
  drawBadge(doc, margin, badgeY, badgeSize, getInitials(team.name), team.logo);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(team.name, margin, badgeY + badgeSize + 5);

  const oppBadgeX = pageWidth - margin - badgeSize;
  drawBadge(doc, oppBadgeX, badgeY, badgeSize, getInitials(match.opponent));
  const oppTextWidth = doc.getTextWidth(match.opponent);
  doc.text(match.opponent, pageWidth - margin - oppTextWidth, badgeY + badgeSize + 5);

  doc.setFontSize(10);
  doc.setTextColor(120);
  const vsWidth = doc.getTextWidth("vs");
  doc.text("vs", pageWidth / 2 - vsWidth / 2, badgeY + badgeSize / 2 + 2);

  y = badgeY + badgeSize + 13;

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${match.competition} · ${format(new Date(match.date), "d MMM yyyy")} · ${match.venue}`, margin, y);
  y += 8;

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Formation: ${lineup.formation}`, margin, y);
  y += 6;

  const pitchX = margin;
  const pitchY = y;
  const pitchWidth = pageWidth - margin * 2;
  const pitchHeight = 120;
  doc.setFillColor(4, 120, 87);
  doc.rect(pitchX, pitchY, pitchWidth, pitchHeight, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(pitchX, pitchY + pitchHeight / 2, pitchX + pitchWidth, pitchY + pitchHeight / 2);
  doc.circle(pitchX + pitchWidth / 2, pitchY + pitchHeight / 2, 12, "S");

  const slots = getFormationSlots(lineup.formation);
  const circleRadius = 6;
  slots.forEach((slot) => {
    const playerId = lineup.startingXI[slot.slot];
    const player = playerId ? playerMap.get(playerId) : undefined;
    if (!player) return;
    const cx = pitchX + (slot.x / 100) * pitchWidth;
    const cy = pitchY + (slot.y / 100) * pitchHeight;

    doc.setFillColor(50, 50, 50);
    doc.circle(cx, cy, circleRadius, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    const initials = getInitials(player.fullName);
    const initialsWidth = doc.getTextWidth(initials);
    doc.text(initials, cx - initialsWidth / 2, cy + 1.5);

    const label = `${player.fullName.split(" ")[0]}${lineup.captainId === player.id ? " (C)" : ""}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const labelWidth = doc.getTextWidth(label);
    doc.setFillColor(0, 0, 0);
    doc.rect(cx - labelWidth / 2 - 1, cy + circleRadius + 1, labelWidth + 2, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(label, cx - labelWidth / 2, cy + circleRadius + 3.9);
  });

  y = pitchY + pitchHeight + 10;

  const substitutePlayers = lineup.substitutes
    .map((id) => playerMap.get(id))
    .filter((player): player is Player => !!player);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Substitutes", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  if (substitutePlayers.length === 0) {
    doc.text("No substitutes named.", margin, y);
    y += 6;
  } else {
    for (const player of substitutePlayers) {
      doc.text(`${player.fullName} — ${player.position} #${player.jerseyNumber}`, margin, y);
      y += 5.5;
    }
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Bench Officials", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  if (benchOfficials.length === 0) {
    doc.text("No bench officials named.", margin, y);
    y += 6;
  } else {
    for (const official of benchOfficials) {
      doc.text(`${official.fullName} — ${official.role}`, margin, y);
      y += 5.5;
    }
  }

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated ${format(new Date(), "d MMM yyyy, HH:mm")} · KickStartGH`, margin, y);

  const filename = `lineup-vs-${match.opponent.toLowerCase().replace(/\s+/g, "-")}`;
  doc.save(`${filename}.pdf`);
}

/**
 * A single game "pulled aside" from a player's timeline — their role and
 * every event they were involved in for that match only, as a standalone
 * PDF a coach can hand to a parent or club official without the full lineup.
 */
export function exportPlayerMatchReportPdf(player: Player, match: Match, team: ActiveTeam) {
  const doc = new jsPDF({ orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Player Match Report", margin, y);
  y += 10;

  const badgeSize = 14;
  drawBadge(doc, margin, y, badgeSize, getInitials(player.fullName));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(player.fullName, margin + badgeSize + 5, y + badgeSize / 2 - 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${player.position} · #${player.jerseyNumber}`, margin + badgeSize + 5, y + badgeSize / 2 + 6);
  y += badgeSize + 10;

  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`${team.name} vs ${match.opponent}`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `${match.competition} · ${format(new Date(match.date), "d MMM yyyy")} · ${match.venue}`,
    margin,
    y
  );
  y += 6;

  const result = getMatchResult(match);
  if (result && match.teamScore !== undefined && match.opponentScore !== undefined) {
    const resultLabel = { win: "Win", draw: "Draw", loss: "Loss" }[result];
    doc.text(`Result: ${resultLabel} ${match.teamScore}–${match.opponentScore}`, margin, y);
    y += 6;
  }

  y += 4;
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const started = match.lineup ? getStartingPlayerIds(match.lineup).includes(player.id) : false;
  const onBench = match.lineup?.substitutes.includes(player.id) ?? false;
  const subOnEvent = match.events.find(
    (event) => event.type === "substitution" && event.playerInId === player.id
  );
  const subOffEvent = match.events.find(
    (event) => event.type === "substitution" && event.playerOutId === player.id
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Appearance", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  let roleLine = "Did not feature.";
  if (subOnEvent) roleLine = `Substitute — came on at minute ${subOnEvent.minute}.`;
  else if (started) roleLine = "Started the match.";
  else if (onBench) roleLine = "Named among the substitutes.";
  if (started && subOffEvent) roleLine += ` Substituted off at minute ${subOffEvent.minute}.`;
  if (match.lineup?.captainId === player.id) roleLine += " Team captain.";
  doc.text(roleLine, margin, y);
  y += 10;

  const goals = match.events.filter((event) => event.type === "goal" && event.playerId === player.id);
  const assists = match.events.filter(
    (event) => event.type === "goal" && event.assistPlayerId === player.id
  );
  const cards = match.events.filter(
    (event) => (event.type === "yellow_card" || event.type === "red_card") && event.playerId === player.id
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Match Events", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);

  const eventLines = [
    ...goals.map((event) => `⚽ Goal — minute ${event.minute}`),
    ...assists.map((event) => `🅰️ Assist — minute ${event.minute}`),
    ...cards.map(
      (event) => `${event.type === "yellow_card" ? "🟨 Yellow card" : "🟥 Red card"} — minute ${event.minute}`
    ),
  ].sort((a, b) => {
    const minuteOf = (line: string) => Number(line.match(/\d+/)?.[0] ?? 0);
    return minuteOf(a) - minuteOf(b);
  });

  if (eventLines.length === 0) {
    doc.text("No goals, assists, or cards recorded.", margin, y);
    y += 6;
  } else {
    for (const line of eventLines) {
      doc.text(line, margin, y);
      y += 5.5;
    }
  }

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated ${format(new Date(), "d MMM yyyy, HH:mm")} · KickStartGH`, margin, y);

  const filename = `${player.fullName.toLowerCase().replace(/\s+/g, "-")}-vs-${match.opponent.toLowerCase().replace(/\s+/g, "-")}`;
  doc.save(`${filename}.pdf`);
}
