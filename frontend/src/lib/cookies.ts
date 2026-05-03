import Cookies from "js-cookie";

export function setToken(token: string) {
  Cookies.set("accessToken", token, { expires: 1 / 96 }) // por 15 min
}

export function getToken(): string | undefined {
  return Cookies.get("accessToken")
}

export function removeToken() {
  Cookies.remove("accessToken")
}

export function setRefreshToken(token: string) {
  Cookies.set("refreshToken", token, { expires: 7 }) // tem que ser 7 dias
}

export function getRefreshToken(): string | undefined {
  return Cookies.get("refreshToken")
}

export function removeRefreshToken() {
  Cookies.remove("refreshToken")
}

export function setUserId(id: string) {
  Cookies.set("userId", id, { expires: 7 }) // 7 dias
}

export function getUserId(): string | undefined {
  return Cookies.get("userId")
}

export function removeUserId() {
  Cookies.remove("userId")
}