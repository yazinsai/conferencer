"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Room = { id: string; name: string };

type ScheduledSession = {
  id: string;
  title: string;
  locationId: string | null;
  startsAt: string | null;
};

function readStoredZoom(storageKey: string) {
  if (typeof window === "undefined") return 100;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return 100;
  const parsed = Number(stored);
  if (Number.isNaN(parsed) || parsed < 50 || parsed > 200) return 100;
  return parsed;
}

export function RoomsGridZoom({
  slug,
  rooms,
  timeSlots,
  scheduled,
  scheduleHref,
}: {
  slug: string;
  rooms: Room[];
  timeSlots: string[];
  scheduled: ScheduledSession[];
  scheduleHref: (submissionId: string) => string;
}) {
  const storageKey = `agenda-rooms-zoom-${slug}`;
  const [zoom, setZoom] = useState(() => readStoredZoom(storageKey));

  useEffect(() => {
    localStorage.setItem(storageKey, String(zoom));
  }, [zoom, storageKey]);

  const slots = timeSlots.length ? timeSlots : ["—"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Zoom</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setZoom((z) => Math.max(50, z - 10))}
          aria-label="Zoom out"
        >
          −
        </Button>
        <span className="min-w-[3rem] text-center text-sm font-medium text-slate-700">{zoom}%</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setZoom((z) => Math.min(200, z + 10))}
          aria-label="Zoom in"
        >
          +
        </Button>
      </div>

      <div className="overflow-x-auto" style={{ zoom: zoom / 100 }}>
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 p-2 text-left">Time</th>
              {rooms.map((room) => (
                <th
                  key={room.id}
                  className="min-w-[140px] border border-slate-200 bg-slate-50 p-2 text-left"
                >
                  {room.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot}>
                <td className="whitespace-nowrap border border-slate-200 p-2 font-medium text-slate-600">
                  {slot}
                </td>
                {rooms.map((room) => {
                  const match = scheduled.find(
                    (s) => s.locationId === room.id && s.startsAt?.includes(`T${slot}`),
                  );
                  return (
                    <td key={room.id} className="border border-slate-200 p-2 align-top">
                      {match ? (
                        <Link
                          href={scheduleHref(match.id)}
                          className="block rounded bg-blue-50 px-2 py-1 text-blue-900 hover:bg-blue-100"
                        >
                          <div className="font-medium">{match.title}</div>
                          <div className="text-[10px] text-blue-700">
                            {match.startsAt?.slice(0, 10)}
                          </div>
                        </Link>
                      ) : (
                        <span className="text-slate-300">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
