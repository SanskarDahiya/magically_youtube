import { log } from 'next-axiom'

export const logDebug = (...props: any) => {
  console.warn(...props)
  log.debug(props.join('-'))
}

export const logInfo = (...props: any) => {
  console.log(...props)
  log.info(props.join('-'))
}

export const logError = (...props: any) => {
  console.error(...props)
  log.error(props.join('-'))
}
