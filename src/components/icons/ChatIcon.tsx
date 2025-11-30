// src/components/icons/ChatIcon.tsx

interface IconProps {
  className?: string;
  size?: number;
}

export const PlusIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M12 5v14m-7-7h14" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const SendIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="m22 2-7 20-4-9-9-4 20-7z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const ImageIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <rect 
      width="18" 
      height="18" 
      x="3" 
      y="3" 
      rx="2" 
      ry="2" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
    <path 
      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" 
      stroke="currentColor" 
      strokeWidth="2"
    />
  </svg>
);

export const ProjectIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M21 14H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      d="M21 18H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2z" 
      stroke="currentColor" 
      strokeWidth="2"
    />
  </svg>
);

export const DownloadIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <polyline 
      points="7,10 12,15 17,10" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <line 
      x1="12" 
      y1="15" 
      x2="12" 
      y2="3" 
      stroke="currentColor" 
      strokeWidth="2"
    />
  </svg>
);

export const SparkleIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="currentColor"
    />
  </svg>
);

export const BoltIcon = ({ className = "", size = 20 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <polygon 
      points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="currentColor"
    />
  </svg>
);