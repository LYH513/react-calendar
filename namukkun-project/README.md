# 개발 환경 세팅방법
### 1. git clone을 통해 프로젝트 폴더를 로컬로 가져옵니다.
### 2. namukkun-project 경로로 들어가서 npm install을 해줍니다.
### 3. 모든 작업은 본인의 브랜치에서 진행되며 브랜치 이동은 git switch 브랜치명
### 4. 현재 존재하는 브랜치를 확인하고 싶다면 git branch -a
### 5. 실행된 화면을 보고싶을 때 namukkun-project 경로에서 npm start
### 6. 커밋을 할 때는 namukkun-project 경로가 아니라 그것보다 한 단게 상위 경로에서 작업해야 합니다. (namukkun-project 경로에서 커밋 x)
### 7. 자신의 브랜치에서 git push (origin)을 하여 pr을 날린 후 깃허브로 들어가 pr을 작성합니다.
### * pr을 날린 후 꼭 말해주세요. 
### 8. 누군가가 pr을 날리고 원격저장소의 main과 병합된 상태라면, git switch main을 통해 브랜치를 main으로 옮기고 git pull을 해줍니다. 그후, 자신의 브랜치로 돌아와 git merge main을 하여 main 브랜치의 변경사항을 자신의 브랜치에 가져오도록 합시다.

---

### * 변경사항을 가져오던 도중 충돌이 발생했는데 어떻게 해결하는지 모르겠다면 물어보도록 해요.
### * API 주소 등 중요한 내용은 src 파일 밖에 .env 파일을 만들어 적읍시다.
### * 커밋 컨벤션을 잘 지키고 즐거운 협업을 해봅시다. 
