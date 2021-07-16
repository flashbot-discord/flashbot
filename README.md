# FlashBot
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/debbd11ee96447e2bb9522ac60acb880)](https://www.codacy.com/app/comjun04/flashbot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=comjun04/flashbot&amp;utm_campaign=Badge_Grade)

FlashBot은 (곧) 여러 게임들을 플레이할 수 있는 봇입니다. 여러 사람끼리 모여 재미있게 플레이해 보세요!

## 특징
봇 제작중

## 설치
### 설치 전 준비사항
* Node.js v14 이상
* `yarn`
* Discord 봇 토큰
* Discord 계정 ~~(당연하겠지만)~~
* 텍스트 편집기 (VSCode 등)

### 설치 방법
1. 이 리포지토리를 `clone`합니다: `git clone https://github.com/flashbot-discord/flashbot.git`
2. Discord 봇 토큰을 입력합니다. 두 가지 방법을 사용할 수 있습니다.
    * 환경 변수에 `flashbotToken`이라는 변수를 추가합니다. 이 변수의 값에 토큰을 넣습니다. **이 설정이 우선적으로 작동합니다.**
    * 아니면 `token.json`이라는 파일을 만들고 그 안에 이 내용을 집어넣습니다: `{"token": "당신의 토큰 값"}`
3. `config.example.js`을 `config.js`으로 복사한 후 편집합니다.
    * `prefix`: 명령어 앞에 붙이는 접두어입니다. 기본값은 `//`입니다. ~~**서버에서 명령어로 설정한 값이 우선적으로 작동됩니다.**~~ 개발 중
    * `owner`: 봇 소유자의 아이디를 입력합니다. 봇 소유자는 모든 제한을 무시하고 모든 명령어를 사용할 수 있습니다.
    * `db`: 봇이 사용할 데이터베이스의 종류입니다. `json`, `mysql`, `pg`를 지원합니다.
        - TODO: 옵션 작성
4. 봇이 설치된 폴더에서 `yarn`을 실행합니다. 필요한 모듈들이 다운로드됩니다.
5. 봇이 설치된 폴더에서 `node .`을 실행합니다. `Logged in as (봇 이름#디스코드 태그)`이 나오면 성공입니다.

