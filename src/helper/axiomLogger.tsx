import { log } from 'next-axiom'
const NODE_ENV_NOT_PROD = process.env.NODE_ENV !== `production`
export const logDebug = (...props: any) => {
  NODE_ENV_NOT_PROD && console.warn(...props)

  log.debug(props.join('-'))
}

export const logInfo = (...props: any) => {
  NODE_ENV_NOT_PROD && console.log(...props)
  log.info(props.join('-'))
}

export const logError = (...props: any) => {
  NODE_ENV_NOT_PROD && console.error(...props)
  log.error(props.join('-'))
}
