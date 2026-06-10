export default function ComingSoon({
  title,
  desc,
  phase,
}: {
  title: string;
  desc?: string;
  phase?: string;
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {desc && <p className="page-desc">{desc}</p>}
        </div>
      </div>
      <div className="coming">
        <div className="coming-ic">🚧</div>
        <h2>준비 중인 기능입니다</h2>
        <p>{phase ? `${phase} 단계에서 제공될 예정입니다.` : "곧 제공될 예정입니다."}</p>
      </div>
    </>
  );
}
