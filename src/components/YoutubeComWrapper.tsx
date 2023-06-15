'use client'

import React, { useEffect, useState } from 'react'
import useAppStore from '@/store/UserStore'
import { useCustomFetch } from '@/components/customFetchButton'
import { googleServiceList, googleServiceListType } from './youtubeInterface'
const preProcessKind = (value: any) => {
  if (typeof value !== 'string') {
    return value
  }
  value = value.replaceAll('youtube#', '')
  return value
}
const YoutubeComWrapper = ({
  isActive,
  value,
  setValue,
  statsCall,
  buttonText,
  yt_service,
  yt_query,
}: {
  isActive?: boolean
  value?: any
  statsCall?: boolean
  setValue?: any
  buttonText?: string
  yt_service?: googleServiceListType
  yt_query?: any
}) => {
  const { data, isLoading, error, __trigger, __reset } = useCustomFetch()

  useEffect(() => {
    if (!isActive) {
      __reset()
    }
  }, [isActive])
  return (
    <div
      className="w-full flex-1 overflow-scroll"
      style={{
        opacity: isActive ? 1 : 0.5,
      }}
    >
      <button
        className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded relative"
        onClick={async () => {
          if (isLoading) return
          const email = useAppStore.getState().user
          if (!email || !yt_query) {
            alert('Invalid Action')
            return
          }
          await __trigger('/api/youtube', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              searchUser: useAppStore.getState().searchUser || email,
              email: email,
              yt_query: yt_query,
              yt_service,
            }),
          })
        }}
      >
        <div
          style={{
            visibility: isLoading ? 'hidden' : 'visible',
          }}
        >
          {buttonText || 'Continue'}
        </div>
        {isLoading && (
          <div
            role="status"
            className="absolute top-0 left-0 bottom-0 right-0 mt-1"
          >
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </button>

      {error && JSON.stringify(error?.message || error)}

      {data && (
        <div>
          <div className="font-bold underline mb-2">
            {preProcessKind(data.kind)}
            <span className="font-normal pl-1">
              {typeof data?.pageInfo?.totalResults === 'number'
                ? `C:${data.pageInfo.totalResults},M:${data.pageInfo.resultsPerPage}`
                : ''}
            </span>
          </div>
          {Array.isArray(data.items) && data.items.length > 0 ? (
            <div>
              {data.items.map((item: any, _: number) => {
                const thisId = item?.id?.videoId || item?.id
                return (
                  <React.Fragment key={_}>
                    {statsCall ? (
                      <div className="break-all cursor-pointer">
                        {typeof item?.statistics?.subscriberCount !==
                        'undefined' ? (
                          <span>
                            subscriberCount:{item?.statistics?.subscriberCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.videoCount !== 'undefined' ? (
                          <span>
                            Videos:{item?.statistics?.videoCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.viewCount !== 'undefined' ? (
                          <span>
                            viewCount:{item?.statistics?.viewCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.commentCount !==
                        'undefined' ? (
                          <span>
                            commentCount:{item?.statistics?.commentCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.dislikeCount !==
                        'undefined' ? (
                          <span>
                            dislikeCount:{item?.statistics?.dislikeCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.likeCount !== 'undefined' ? (
                          <span>
                            likeCount:{item?.statistics?.likeCount}
                            <br />
                          </span>
                        ) : null}
                        {typeof item?.statistics?.favoriteCount !==
                        'undefined' ? (
                          <span>
                            favoriteCount:{item?.statistics?.favoriteCount}
                            <br />
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        className="flex break-all cursor-pointer px-1 py-2"
                        onClick={() => {
                          setValue((x: string) => {
                            if (x === thisId) {
                              return ''
                            }
                            return thisId
                          })
                        }}
                      >
                        <input
                          type="radio"
                          name="test"
                          checked={value === thisId}
                          onChange={() => {
                            setValue(thisId)
                          }}
                        />
                        <div className="ml-1">
                          {preProcessKind(item.kind) + ':'}
                          <br />
                          {item?.snippet?.customUrl ||
                            item?.snippet?.title ||
                            thisId}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          ) : (
            JSON.stringify({ items: data.items })
          )}
        </div>
      )}
    </div>
  )
}

export default function () {
  const [_channelId, setChannelId] = useState('')
  const [_videoId, setVideoId] = useState('')
  const videoId = (typeof _videoId === 'string' && _videoId.trim()) || ''
  const channelId = (typeof _channelId === 'string' && _channelId.trim()) || ''
  return (
    <>
      <div className="flex justify-between min-h-[20vh] mb-4">
        {/* https://developers.google.com/youtube/v3/docs/ */}
        {/* Use this api to see yt_service * yt_query for respected params */}
        <YoutubeComWrapper
          value={channelId}
          setValue={setChannelId}
          isActive
          yt_service="channels"
          buttonText="Fetch Channel List"
          yt_query={{
            part: ['id', 'snippet'],
            mine: true,
          }}
        />
        <YoutubeComWrapper
          isActive={!!channelId}
          yt_service="channels"
          buttonText="Get Stats"
          statsCall
          yt_query={{
            part: ['statistics'],
            id: [channelId],
          }}
        />
        {/* <YoutubeComWrapper
          isActive={!!channelId}
          buttonText="Get Live Video List"
          yt_service="search"
          yt_query={{
            part: ['snippet'],
            eventType: 'live',
            type: 'video',
            channelId: channelId,
          }}
        /> */}
      </div>
      <div className="flex justify-between">
        <YoutubeComWrapper
          value={videoId}
          setValue={setVideoId}
          isActive={!!channelId}
          yt_service="search"
          buttonText="Fetch Live Video List"
          yt_query={{
            channelId: channelId,
            part: ['snippet'],
            eventType: 'live',
            type: 'video',
          }}
        />
        <YoutubeComWrapper
          isActive={!!channelId && !!videoId}
          buttonText="Video Stat"
          yt_service="videos"
          statsCall
          yt_query={{
            id: videoId,
            part: ['statistics', 'snippet'],
            type: 'video',
          }}
        />
      </div>
    </>
  )
}
