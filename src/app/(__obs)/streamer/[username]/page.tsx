import ObsHomeComponent from '@/components/ObsHomeComponent'
import validateUserName from '@/components/validateUserName'

export default async function Component(props: any) {
  const isStreamerHasCampaignId = await validateUserName(
    props?.params?.username
  )

  return (
    <ObsHomeComponent
      {...props}
      API_URL="/api/v1/campaign/update"
      isStreamerHasCampaignId={!!isStreamerHasCampaignId}
    />
  )
}
