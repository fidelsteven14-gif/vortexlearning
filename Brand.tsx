export default function Brand({ className = "" }: { className?: string }) {
  return (
    <a className={`brand ${className}`.trim()} href="/" aria-label="VORTEX LEARNING home">
      <img className="brand-logo" src="/vortex-learning-mark.png" alt="" />
      <span className="brand-copy"><span className="brand-name">VORTEX</span><span className="brand-subtitle">LEARNING</span></span>
    </a>
  );
}
