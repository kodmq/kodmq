export function welcomeMessage(name: string) {
  console.log(`Welcome, ${name}!`)
}

export function happyBirthdayMessage({ name, age }: { name: string, age: number }) {
  console.log(`Happy ${age}th birthday, ${name}!`)
}

export function promotionMessage(promoted: boolean) {
  if (promoted) {
    console.log("Congratulations, you've been promoted!")
  } else {
    console.log("Sorry, you've not been promoted.")
  }
}

export const handlers = {
  welcomeMessage,
  happyBirthdayMessage,
  promotionMessage,
}
