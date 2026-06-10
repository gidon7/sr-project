import ResourcePage from "../components/ResourcePage";

export default function Teachers() {
  return (
    <ResourcePage
      title="교사 관리"
      desc="교사 정보와 역할을 관리합니다."
      endpoint="/api/teachers"
      addLabel="교사 추가"
      columns={[
        { key: "name", label: "이름" },
        { key: "role", label: "역할" },
        { key: "subject", label: "담당 과목" },
        { key: "email", label: "이메일" },
      ]}
      fields={[
        { key: "name", label: "이름 *" },
        {
          key: "role",
          label: "역할",
          type: "select",
          options: ["교과교사", "담임교사", "보직교사", "교무담당", "관리자"],
        },
        { key: "subject", label: "담당 과목" },
        { key: "email", label: "이메일" },
      ]}
    />
  );
}
