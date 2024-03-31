import PoseDetection from './PoseDetection'
import StaticPose from './StaticPose'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const App = () => {
  return (
    <div>
      <Tabs defaultValue="static" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="static">Static</TabsTrigger>
        </TabsList>
        <TabsContent value="detection">
          <PoseDetection />
        </TabsContent>
        <TabsContent value="static">
          <StaticPose />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
