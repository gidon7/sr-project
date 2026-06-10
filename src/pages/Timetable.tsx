import ResourcePage from "../components/ResourcePage";

export default function Timetable() {
  return (
    <ResourcePage
      title="시간표 관리"
      desc="요일·교시별 수업을 관리합니다."
      endpoint="/api/timetable"
      addLabel="시간표 추가"
      columns={[
        { key: "day", label: "요일" },
        { key: "period", label: "교시" },
        { key: "class_name", label: "학급" },
        { key: "subject", label: "과목" },
        { key: "teacher", label: "교사" },
      ]}
      fields={[
        { key: "day", label: "요일", type: "select", options: ["월", "화", "수", "목", "금"] },
        {
          key: "period",
          label: "교시",
          type: "select",
          options: ["1교시", "2교시", "3교시", "4교시", "5교시", "6교시", "7교시"],
        },
        { key: "class_name", label: "학급 (예: 2-3)" },
        { key: "subject", label: "과목" },
        { key: "teacher", label: "교사" },
      ]}
    />
  );
}
