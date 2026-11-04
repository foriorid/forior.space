import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconHome = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export const IconBuilding = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    <path d="M10 21v-3h4v3" />
  </svg>
);

export const IconStore = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 10l1.2-4.2A1.5 1.5 0 0 1 6.6 4.7h10.8a1.5 1.5 0 0 1 1.4 1.1L20 10" />
    <path d="M4 10a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
    <path d="M5 11v9h14v-9" />
    <path d="M9.5 20v-4.5h5V20" />
  </svg>
);

export const IconLandscape = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="7.5" cy="8" r="2" />
    <path d="M3 20h18" />
    <path d="M3 17.5l4-5 3.5 3.5 3.5-4.5 7 6" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
  </svg>
);

export const IconBed = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 7v11M3 12h18v6M21 18v-5a3 3 0 0 0-3-3H9v3" />
    <circle cx="6" cy="10" r="1.3" />
  </svg>
);

export const IconBath = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
    <path d="M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
    <path d="M8 6h3" />
    <path d="M7 19l-1 2M18 19l1 2" />
  </svg>
);

export const IconRuler = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
  </svg>
);

export const IconLand = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 20h18" />
    <path d="M6 20V9l6-4 6 4v11" />
    <path d="M9 20v-4h6v4" />
  </svg>
);

export const IconCar = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 11l1.5-4A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1l1.5 4" />
    <path d="M3 11h18v5H3z" />
    <circle cx="7" cy="18" r="1.5" />
    <circle cx="17" cy="18" r="1.5" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const IconChevronRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconSparkles = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
  </svg>
);

export const IconUpload = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M15 12H5" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconPool = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 16c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
    <path d="M2 20c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
    <path d="M8 14V5a2 2 0 0 1 4 0M12 14V5a2 2 0 0 1 4 0" />
  </svg>
);

export const IconDumbbell = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 6.5 17.5 17.5M4 8l-1.5 1.5M20 16l1.5-1.5" />
    <rect x="3.5" y="6.5" width="4" height="4" rx="1" transform="rotate(45 5.5 8.5)" />
    <rect x="16.5" y="13.5" width="4" height="4" rx="1" transform="rotate(45 18.5 15.5)" />
  </svg>
);

export const IconRun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="14" cy="5" r="2" />
    <path d="M12 21l1.5-5-3-2.5 1-5 3.5 2 2.5 1" />
    <path d="M9 10 6 9M12.5 8.5 10 14l-3 1" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconWifi = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLift = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M12 3v18M9 9l-1.5 2h3zM9 15l-1.5-2h3z" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconCart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.2 11.2A2 2 0 0 0 9.2 17h7.5a2 2 0 0 0 2-1.6L20 8H6" />
    <circle cx="9.5" cy="20" r="1.3" />
    <circle cx="16.5" cy="20" r="1.3" />
  </svg>
);

export const IconHospital = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M12 8v6M9 11h6" />
  </svg>
);

export const IconSchool = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4 2 9l10 5 10-5-10-5Z" />
    <path d="M6 11.5V16c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-4.5" />
    <path d="M22 9v5" />
  </svg>
);

export const IconTrain = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5" y="3" width="14" height="13" rx="3" />
    <path d="M5 11h14" />
    <circle cx="8.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M7 20l-1.5 1.5M17 20l1.5 1.5M8 16l-1 2M16 16l1 2" />
  </svg>
);

export const IconUtensils = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 3v7a2 2 0 0 0 4 0V3M7 10v11" />
    <path d="M17 3c-1.7 0-3 2-3 5s1.3 4 3 4m0-9v18" />
  </svg>
);

export const IconMosque = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c2 1.8 3 3.4 3 5 0 1.2-1 2-3 2s-3-.8-3-2c0-1.6 1-3.2 3-5Z" />
    <path d="M5 12v9M19 12v9M5 21h14" />
    <path d="M9 21v-3a3 3 0 0 1 6 0v3" />
  </svg>
);

export const IconTree = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c-3 0-5 2.2-5 4.8 0 1 .4 1.9 1 2.6-1.2.6-2 1.8-2 3.1C6 15.5 7.8 17 10 17h4c2.2 0 4-1.5 4-3.5 0-1.3-.8-2.5-2-3.1.6-.7 1-1.6 1-2.6C17 5.2 15 3 12 3Z" />
    <path d="M12 17v4" />
  </svg>
);
