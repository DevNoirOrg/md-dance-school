// lucide „user-round-group” ikon (lucide-static v1.61.0, ISC licenc).
// A projektben lévő lucide-react (0.383) még nem tartalmazza, ezért helyben definiáljuk,
// ugyanazzal a használattal: <UserRoundGroup size={32} strokeWidth={1.8} />
export default function UserRoundGroup({ size = 24, strokeWidth = 2, color = 'currentColor', className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-user-round-group ${className}`}
      {...props}
    >
      <path d="M17 21a5 5 0 00-10 0" />
      <path d="M22 10.5a3.5 3.5 0 00-5.507-2.868" />
      <path d="M7.507 7.632A3.5 3.5 0 002 10.5" />
      <circle cx="12" cy="13" r="3" />
      <circle cx="18.5" cy="4.5" r="2.5" />
      <circle cx="5.5" cy="4.5" r="2.5" />
    </svg>
  )
}
