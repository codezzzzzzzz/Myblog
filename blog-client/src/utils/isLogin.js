export function isLogin() {
  if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
    return true
  } else {
    return false
  }
}