import axios from "axios";
const USE_MOCK = false;

const api = axios.create({
  // 개발 중
  // baseURL: "http://localhost:8000",

  // 배포 후
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

export const askChat = async (message) => {

  if (USE_MOCK) {

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      answer: `Mock 응답입니다.\n"${message}"에 대한 답변입니다.`
    };
  }

  const { data } = await api.post("/chat", {
    message,
  });

  return data;

};
