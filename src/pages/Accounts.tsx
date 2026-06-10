import { useAuth } from "../auth";

const ROLES = [
  { name: "교과교사", desc: "담당 과목 수업 자료·세특 작성" },
  { name: "담임교사", desc: "학급 학생 생기부·상담 관리" },
  { name: "보직교사", desc: "부서 업무 문서·템플릿 관리" },
  { name: "교무담당", desc: "학사 일정·시간표·규정 관리" },
  { name: "관리자", desc: "전체 계정·권한·시스템 관리" },
];

export default function Accounts() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">계정·권한 관리</h1>
          <p className="page-desc">로그인 계정과 역할 권한 체계입니다.</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-head">
          <h2>내 계정</h2>
        </div>
        <table className="data-table">
          <tbody>
            <tr>
              <td className="cell-muted" style={{ width: "30%" }}>
                이메일
              </td>
              <td className="cell-strong">{user?.email}</td>
            </tr>
            <tr>
              <td className="cell-muted">권한</td>
              <td>
                <span className="badge badge-blue">관리자</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>역할 권한 체계</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>역할</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r.name}>
                <td className="cell-strong">{r.name}</td>
                <td>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
