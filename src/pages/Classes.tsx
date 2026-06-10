import ResourcePage from "../components/ResourcePage";

export default function Classes() {
  return (
    <ResourcePage
      title="학급·반 관리"
      desc="학년/반과 담임을 관리합니다."
      endpoint="/api/classes"
      addLabel="학급 추가"
      columns={[
        { key: "grade", label: "학년" },
        { key: "class_no", label: "반" },
        { key: "homeroom", label: "담임" },
        { key: "note", label: "비고" },
      ]}
      fields={[
        { key: "grade", label: "학년 *", type: "select", options: ["1학년", "2학년", "3학년"] },
        { key: "class_no", label: "반 (예: 3반)" },
        { key: "homeroom", label: "담임 교사" },
        { key: "note", label: "비고" },
      ]}
    />
  );
}
