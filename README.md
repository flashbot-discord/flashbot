# FlashBot
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/debbd11ee96447e2bb9522ac60acb880)](https://www.codacy.com/app/comjun04/flashbot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=comjun04/flashbot&amp;utm_campaign=Badge_Grade)
[![CodeFactor](https://www.codefactor.io/repository/github/comjun04/flashbot/badge)](https://www.codefactor.io/repository/github/comjun04/flashbot)

FlashBot은 취미생활로 만들어진 어떤 제작자의 봇입니다.

## 특징
아직은.. 없네요..

## 설치
### 설치 전 준비사항
* Node.js 8~10 (10.16.0으로 개발 빛 테스트함) 및 npm
    * 주의: Node.js 11 이상 버전에서는 `npm install`할 때 오류가 납니다! 꼭 위의 버전에 맞게 설치하세요.
* Discord 봇 토큰
* Discord 계정 ~~(당연하겠지만)~~
* 텍스트 편집기 (VSCode 등)

### 설치 방법
1. 이 리포지토리를 `clone`합니다: `git clone https://github.com/comjun04/flashbot.git`
2. Discord 봇 토큰을 입력합니다. 두 가지 방법이 존재합니다.
    * 환경 변수에 `token`이라는 변수를 추가합니다. 이 변수의 값에 토큰을 넣습니다. **이 설정이 우선적으로 작동합니다.**
    * 아니면 `token.json`이라는 파일을 만들고 그 안에 이 내용을 집어넣습니다:
`{"token": "당신의 토큰 값"}`
3. 설정 파일인 `config.json`을 적당히 편집합니다.
    * `prefix`: 명령어 앞에 붙이는 접두어입니다. 기본값은 `//`입니다. ~~**서버에서 명령어로 설정한 값이 우선적으로 작동됩니다.**~~
    * `version`: 이 봇의 버전입니다. 업데이트 및 `help` 명령어 사용 시 나오므로 **변경하지 마세요.** ~~변경했다가 업데이트 못 하는 사단이 나도 책임지지 않습니다~~
    * `build_date`: 이 봇의 해당 버전의 최종 개발(코드 편집) 날짜입니다. 이것도 **변경하지 마세요.**
4. 봇이 설치된 폴더에서 `npm install`을 실행합니다. 필요한 모듈들이 다운로드됩니다. 만약 `ERR!` 등의 오류가 나오면 새로운 Issue를 만들어서 오류 내용을 올려 주세요.
5. 봇이 설치된 폴더에서 `node .`을 실행합니다. `Logged in as (봇 이름#디스코드 태그)`이 나오면 성공입니다.

## 공개 봇
**Flashbot의 공개 봇은 `Flashbot#8462`이고, 개발용 베타 봇은 `FlashBot Beta#7895`입니다.** 다른 사람이 호스팅하는 봇을 초대했다가 어떤 문제가 발생해도 **개발자는 책임지지 않습니다.**
