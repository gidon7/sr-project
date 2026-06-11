-- 데모 계정(admin@demo.local) 간이 데이터 시드
-- 적용: wrangler d1 execute sr-project-db --remote -y --file=./seed/demo.sql
-- (재실행 가능: 기존 데모 데이터 삭제 후 재삽입)

-- 0) 기존 데모 데이터 정리
DELETE FROM analyses WHERE record_id IN (SELECT r.id FROM records r JOIN students s ON s.id=r.student_id WHERE s.user_id=(SELECT id FROM users WHERE email='admin@demo.local'));
DELETE FROM records WHERE student_id IN (SELECT id FROM students WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local'));
DELETE FROM students  WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM materials WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM documents WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM templates WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM teachers  WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM classes   WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');
DELETE FROM timetable WHERE user_id=(SELECT id FROM users WHERE email='admin@demo.local');

-- 1) 학생
INSERT INTO students (user_id,name,grade,target_major) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'홍길동','2학년 자연계','생명공학과'),
((SELECT id FROM users WHERE email='admin@demo.local'),'김토토','2학년 자연계','컴퓨터공학과'),
((SELECT id FROM users WHERE email='admin@demo.local'),'이방울','3학년 인문계','경영학과'),
((SELECT id FROM users WHERE email='admin@demo.local'),'박하늘','1학년','미정'),
((SELECT id FROM users WHERE email='admin@demo.local'),'최우주','3학년 자연계','화학공학과');

-- 2) 생기부 기록 (일부 학생)
INSERT INTO records (student_id,title,content) VALUES
((SELECT id FROM students WHERE name='홍길동' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2025 1학기 생기부',
'[교과세특] 생명과학1: 효소의 작용 실험에서 온도와 pH에 따른 반응 속도 차이에 의문을 갖고 추가 탐구를 수행함. [동아리활동] 생명탐구반에서 미생물 배양 실험을 설계하고 결과를 그래프로 정리함. [진로활동] 생명공학 연구원 직업 탐색 후 유전자 가위 기술을 주제로 보고서를 작성함. [행동특성 및 종합의견] 호기심이 많고 끈기 있게 탐구하며 조원을 배려함.'),
((SELECT id FROM students WHERE name='홍길동' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2025 2학기 생기부',
'[교과세특] 생명과학2: 유전자 발현 조절을 주제로 심화 탐구를 진행하고 모형을 제작해 발표함. [동아리활동] 미생물 배양 실험을 반복 수행해 데이터 신뢰도를 높임. [진로활동] 생명공학 연구 윤리를 주제로 토론에 참여함. [행동특성 및 종합의견] 1학기에 비해 탐구의 깊이가 향상되고 자기주도성이 강화됨.'),
((SELECT id FROM students WHERE name='김토토' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2025 1학기 생기부',
'[교과세특] 정보: 파이썬으로 학급 설문 결과를 시각화하는 프로그램을 제작함. [동아리활동] 코딩동아리에서 간단한 웹앱을 개발해 발표함. [진로활동] 인공지능 윤리를 주제로 토론에 참여함. [행동특성 및 종합의견] 논리적 사고가 뛰어나고 문제 해결에 적극적임.'),
((SELECT id FROM students WHERE name='이방울' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2025 1학기 생기부',
'[교과세특] 경제: 시장 수요와 공급의 변화를 실제 사례로 분석해 발표함. [동아리활동] 경영토론반에서 청소년 창업 아이디어를 기획하고 사업계획서를 작성함. [진로활동] 마케팅 직무를 탐색한 뒤 SNS 홍보 전략을 주제로 보고서를 작성함. [행동특성 및 종합의견] 의사소통 능력이 뛰어나고 팀을 이끄는 리더십이 돋보임.'),
((SELECT id FROM students WHERE name='박하늘' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2024 1학년 생기부',
'[교과세특] 통합과학: 일상 속 과학 원리에 흥미를 보이며 실험 활동에 적극 참여함. [자율활동] 학급 도서부장으로서 독서 캠페인을 기획해 운영함. [진로활동] 다양한 직업 탐색 활동에 참여하며 관심 분야를 넓힘. [행동특성 및 종합의견] 성실하고 친구들과 두루 잘 지내며 책임감이 강함.'),
((SELECT id FROM students WHERE name='최우주' AND user_id=(SELECT id FROM users WHERE email='admin@demo.local')),'2024 2학기 생기부',
'[교과세특] 화학2: 산화환원 반응을 일상 사례와 연결해 설명하는 발표를 진행함. [동아리활동] 화학실험반에서 전기분해 실험을 수행하고 결과를 정리함. [진로활동] 화학공학 분야의 신소재 개발을 주제로 자료를 조사함. [행동특성 및 종합의견] 성실하고 실험 설계 능력이 우수하며 안전 수칙을 잘 지킴.');

-- 3) 수업 자료 (AI 생성 예시)
INSERT INTO materials (user_id,title,type,subject,grade,difficulty,topic,content) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'2단원 세포의 구조와 기능','quiz','과학','1학년','보통','세포의 구조와 기능',
'<h3>세포의 구조와 기능 퀴즈</h3><ol><li>세포에서 에너지를 생성하는 소기관은? <br>① 리보솜 ② 미토콘드리아 ③ 골지체 ④ 액포<br><b>정답: ②</b> 미토콘드리아는 세포 호흡으로 ATP를 생성한다.</li><li>유전 정보를 저장하는 곳은? <br>① 핵 ② 세포막 ③ 소포체 ④ 엽록체<br><b>정답: ①</b></li></ol>'),
((SELECT id FROM users WHERE email='admin@demo.local'),'3단원 조선의 건국','fill_blank','사회','2학년','쉬움','조선의 건국',
'<h3>조선의 건국 빈칸 채우기</h3><p>1. 조선을 건국한 인물은 ____ 이다.</p><p>2. 조선의 도읍은 ____ 이다.</p><p>3. 정도전은 ____ 정치를 강조하였다.</p><hr><p><b>정답</b>: 1. 이성계 2. 한양 3. 재상 중심</p>'),
((SELECT id FROM users WHERE email='admin@demo.local'),'민주주의와 권위주의 비교','compare','사회','3학년','어려움','민주주의와 권위주의',
'<h3>민주주의 vs 권위주의</h3><table><tr><th>구분</th><th>민주주의</th><th>권위주의</th></tr><tr><td>권력의 원천</td><td>국민</td><td>소수 지배층</td></tr><tr><td>의사결정</td><td>토론과 합의</td><td>일방적 결정</td></tr><tr><td>언론</td><td>자유 보장</td><td>통제</td></tr></table>'),
((SELECT id FROM users WHERE email='admin@demo.local'),'1단원 방정식과 부등식 요약','summary','수학','1학년','보통','방정식과 부등식',
'<h3>방정식과 부등식 핵심 요약</h3><ul><li>일차방정식: 양변에 같은 수를 더하거나 곱해 해를 구한다.</li><li>이차방정식: 인수분해 또는 근의 공식을 사용한다.</li><li>부등식: 양변에 음수를 곱하면 부등호 방향이 바뀐다.</li></ul>');

-- 4) 문서
INSERT INTO documents (user_id,title,content) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'5월 가정통신문','<h2>가정통신문</h2><p>학부모님께,</p><p>5월 현장체험학습 일정과 준비물을 안내드립니다. 자세한 내용은 아래를 참고해 주세요.</p><ul><li>일시: 5월 20일(수)</li><li>장소: 국립과학관</li><li>준비물: 도시락, 필기구</li></ul>'),
((SELECT id FROM users WHERE email='admin@demo.local'),'학급 규칙 안내','<h2>2학년 3반 학급 규칙</h2><ol><li>등교 시간을 지킵니다.</li><li>서로 존중하고 배려합니다.</li><li>교실 청결을 함께 유지합니다.</li></ol>');

-- 5) 템플릿
INSERT INTO templates (user_id,title,content) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'가정통신문 기본 양식','<h2>가정통신문</h2><p>학부모님께,</p><p>(내용을 입력하세요)</p><p>OO학교 드림</p>'),
((SELECT id FROM users WHERE email='admin@demo.local'),'세특 작성 양식','<h3>과목별 세부능력 및 특기사항</h3><p>(관찰 내용)에 흥미를 보이며 (탐구 활동)을 수행함. 이를 통해 (역량)이 향상됨.</p>');

-- 6) 교사
INSERT INTO teachers (user_id,name,email,role,subject) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'김과학','science@demo.local','담임교사','과학'),
((SELECT id FROM users WHERE email='admin@demo.local'),'이수학','math@demo.local','교과교사','수학'),
((SELECT id FROM users WHERE email='admin@demo.local'),'박사회','social@demo.local','보직교사','사회'),
((SELECT id FROM users WHERE email='admin@demo.local'),'정국어','korean@demo.local','교무담당','국어');

-- 7) 학급
INSERT INTO classes (user_id,grade,class_no,homeroom,note) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'1학년','2반','정국어','28명'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2학년','3반','김과학','27명'),
((SELECT id FROM users WHERE email='admin@demo.local'),'3학년','1반','박사회','25명');

-- 8) 시간표
INSERT INTO timetable (user_id,class_name,day,period,subject,teacher) VALUES
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','월','1교시','과학','김과학'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','월','2교시','수학','이수학'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','화','1교시','사회','박사회'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','화','3교시','국어','정국어'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','수','2교시','과학','김과학'),
((SELECT id FROM users WHERE email='admin@demo.local'),'2-3','목','4교시','수학','이수학');
