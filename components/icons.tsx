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
    <path d="M17.5 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.96-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5A9.42 9.42 0 0 1 18.7 5.38a9.36 9.36 0 0 1 2.76 6.66 9.42 9.42 0 0 1-9.41 9.46Zm5.82-15.47A11.2 11.2 0 0 0 12.05.72C5.86.72.83 5.75.83 11.94c0 1.98.52 3.9 1.5 5.6L.74 23.28l5.88-1.54a11.2 11.2 0 0 0 5.42 1.38h.01c6.19 0 11.22-5.03 11.23-11.22a11.16 11.16 0 0 0-3.44-7.87Z" />
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
