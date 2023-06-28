import ObsHomeComponent from '@/components/ObsHomeComponent'

export default function Component(props: any) {
  return <ObsHomeComponent {...props} API_URL="/api/v1/loco_campaign/update" />
}
