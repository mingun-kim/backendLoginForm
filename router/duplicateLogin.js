const logModule = require("./logModule");


const listener = store => {
    const page = req.path || "";
    const uri = page.replace(/?.*/, "");
  
    // 정적파일 요청의 경우 스킵
    if (uri.includes(".")) {
      next();
      return;
    }
  
    // 중복 로그인 체크
    if (req.session.user) {
        const { user } = req.session;
        store.all((_, sessions) => {
            sessions.forEach( e=> {
            // 세션에 사용자 정보가 담겨있고, 담겨있는 사용자의 아이디와 현재 세션의 사용자 아이디가 같지만
            // 세션의 ID가 다른 경우 다른 디바이스에서 접속한걸로 간주하고 이전에 등록된 세션을 파괴한다.
            if (e.user && e.user. id== user.id && e.id != req.session.id) {
                store.destroy(e.id, error=> {/* redis 오류로 인한 에러 핸들링 */});
            }
            });
        });
    }
}
  module.exports = listener;