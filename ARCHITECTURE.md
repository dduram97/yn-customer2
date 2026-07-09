# yn-customer Architecture


## 1. 기술 스택


Frontend:

- Next.js
- TypeScript
- Tailwind CSS


Deployment:

- Vercel


Database:

고객 서비스는 직접 DB를 관리하지 않는다.


연동:

yn-order-manager API 사용



# 2. 프로젝트 구조


app/

├ page.tsx

├ tracking/

│  └ page.tsx

├ guide/

│  ├ storage/

│  │  └ page.tsx

│  └ how-to-eat/

│     └ page.tsx

└ contact/

   └ page.tsx



components/

공통 UI 컴포넌트


- Header
- BottomNavigation
- ProductCard
- GuideCard
- Button
- DeliveryStatus


lib/

API 및 데이터 처리


- api client
- types
- utils



public/

이미지 파일



# 3. 시스템 구조


고객:

카카오톡 알림톡 클릭

↓

yn-customer

↓

API 요청

↓

yn-order-manager

↓

배송 데이터 반환



중요:

yn-customer는 관리자 DB에 직접 접근하지 않는다.



# 4. 배송조회 API 구조


## 요청


GET

/api/tracking


전달 데이터:

token


예:

/tracking?t=encrypted_token



## 처리


1.
token 검증


2.
yn-order-manager API 요청


3.
배송 데이터 반환


4.
화면 표시



# 5. 보안 설계


반드시 적용:


금지:

- DB 직접 연결
- 관리자 API Key 노출
- URL에 운송장번호 직접 노출
- 고객 전체 주문 데이터 반환


적용:

- Token 방식 인증
- Token 만료시간 적용
- 필요한 주문 정보만 반환
- API Route 사용



# 6. API 응답 예시


{
 productName:
 "과메기 세트",

 courier:
 "CJ대한통운",

 trackingNumber:
 "123456789",

 status:
 "배송중",

 location:
 "대전 물류센터"
}



# 7. 컴포넌트 설계


공통:

Header

Footer

Button

Card


배송:

TrackingCard

DeliveryStep

StatusBadge


가이드:

ProductGuideCard

StorageInfo

EatingGuide



# 8. 개발 원칙


- 유지보수 쉬운 구조
- 컴포넌트 재사용
- 모바일 성능 우선
- SEO 고려
- 카카오톡 공유 최적화
- 추후 Notion CMS 연동 가능 구조 고려



# 9. 구현 순서


1.
프로젝트 기본 구조 생성


2.
공통 레이아웃 제작


3.
메인 페이지 제작


4.
보관방법 페이지 제작


5.
먹는법 페이지 제작


6.
배송조회 UI 제작


7.
API 연동


8.
보안 검토


9.
Vercel 배포