export const validateEmail=(email)=>{
    const emailRegex=/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
}

export const username=(username)=>{
    const usernameRegex=/^[a-zA-Z][a-zA-Z0-9_]{4,19}$/
    return usernameRegex.test(username)
}




