// 엄선된 명언 데이터셋 (인생, 도전, 지혜, 성장, 행복)
const QUOTES = [
  {
    quote: "가장 어두운 밤도 언젠가는 끝나고 해는 떠오를 것이다.",
    author: "빅토르 위고 (Victor Hugo)",
    tag: "희망"
  },
  {
    quote: "시작이 반이다. 무엇이든 시작하라.",
    author: "아리스토텔레스 (Aristotle)",
    tag: "도전"
  },
  {
    quote: "오늘 하루를 당신 인생의 최고의 날로 만들어라.",
    author: "마크 트웨인 (Mark Twain)",
    tag: "동기부여"
  },
  {
    quote: "꿈을 이룰 수 있는 가장 좋은 방법은 깨어있는 것이다.",
    author: "폴 발레리 (Paul Valery)",
    tag: "성공"
  },
  {
    quote: "작은 변화가 일어날 때 진정한 삶을 살게 된다.",
    author: "레프 톨스토이 (Leo Tolstoy)",
    tag: "성장"
  },
  {
    quote: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 옳다.",
    author: "헨리 포드 (Henry Ford)",
    tag: "신념"
  },
  {
    quote: "행복은 목적지가 아니라 여행하는 방식이다.",
    author: "로이 M. 굿맨 (Roy M. Goodman)",
    tag: "행복"
  },
  {
    quote: "천 리 길도 한 걸음부터.",
    author: "노자 (Lao Tzu)",
    tag: "지혜"
  },
  {
    quote: "바람이 불지 않으면 노를 저어라.",
    author: "윈스턴 처칠 (Winston Churchill)",
    tag: "열정"
  },
  {
    quote: "스스로를 신뢰하라. 그러면 어떻게 살아야 할지 알게 될 것이다.",
    author: "요한 볼프강 폰 괴테 (Goethe)",
    tag: "자신감"
  },
  {
    quote: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세다.",
    author: "알베르트 아인슈타인 (Albert Einstein)",
    tag: "혁신"
  },
  {
    quote: "인생이란 폭풍우가 지나가기를 기다리는 것이 아니라 빗속에서 춤추는 것을 배우는 것이다.",
    author: "비비안 그린 (Vivian Greene)",
    tag: "인생"
  },
  {
    quote: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.",
    author: "프랭클린 D. 루스벨트 (Franklin D. Roosevelt)",
    tag: "용기"
  },
  {
    quote: "단순함이 궁극의 정교함이다.",
    author: "레오나르도 다빈치 (Leonardo da Vinci)",
    tag: "통찰"
  },
  {
    quote: "배움을 멈춘 사람은 스무 살이든 여든 살이든 늙은 것이다.",
    author: "헨리 포드 (Henry Ford)",
    tag: "배움"
  },
  {
    quote: "기회는 일어나는 것이 아니라 만들어내는 것이다.",
    author: "크리스 그로서 (Chris Grosser)",
    tag: "기회"
  },
  {
    quote: "행동은 모든 성공의 가장 기초적인 열쇠다.",
    author: "파블로 피카소 (Pablo Picasso)",
    tag: "실행"
  },
  {
    quote: "모든 위대한 생각은 걷기에서 시작된다.",
    author: "프리드리히 니체 (Friedrich Nietzsche)",
    tag: "영감"
  },
  {
    quote: "당신의 시간은 한정되어 있으니 다른 사람의 삶을 사느라 낭비하지 마라.",
    author: "스티브 잡스 (Steve Jobs)",
    tag: "가치"
  },
  {
    quote: "미래는 자신의 꿈이 가진 아름다움을 믿는 사람들의 것이다.",
    author: "엘리너 루스벨트 (Eleanor Roosevelt)",
    tag: "꿈"
  },
  {
    quote: "산을 움직이려는 이는 작은 돌을 들어내는 것부터 시작한다.",
    author: "공자 (Confucius)",
    tag: "끈기"
  },
  {
    quote: "성공이란 열정을 잃지 않고 실패를 거듭할 수 있는 능력이다.",
    author: "윈스턴 처칠 (Winston Churchill)",
    tag: "성공"
  },
  {
    quote: "오늘의 고통은 내일의 힘이 된다.",
    author: "알 수 없음 (Anonymous)",
    tag: "인내"
  },
  {
    quote: "지혜는 경험의 딸이다.",
    author: "레오나르도 다빈치 (Leonardo da Vinci)",
    tag: "지혜"
  },
  {
    quote: "내일의 짐까지 오늘 지려고 하지 마라. 하루에 그날의 괴로움만으로 족하다.",
    author: "데일 카네기 (Dale Carnegie)",
    tag: "마음챙김"
  },
  {
    quote: "어려움 속에 기회가 숨어 있다.",
    author: "알베르트 아인슈타인 (Albert Einstein)",
    tag: "기회"
  },
  {
    quote: "지속적인 긍정적 태도는 모든 상황을 극복하게 만든다.",
    author: "콜린 파월 (Colin Powell)",
    tag: "긍정"
  },
  {
    quote: "배우고 때로 익히면 또한 기쁘지 아니한가.",
    author: "논어 (The Analects)",
    tag: "배움"
  },
  {
    quote: "우리는 우리가 반복적으로 하는 행동의 결과다. 그러므로 탁월함은 행동이 아니라 습관이다.",
    author: "아리스토텔레스 (Aristotle)",
    tag: "습관"
  },
  {
    quote: "당신이 바라던 변화가 스스로 되어라.",
    author: "마하트마 간디 (Mahatma Gandhi)",
    tag: "변화"
  }
];
