import { useEffect } from 'react'
import LivePoseDetector from './LivePoseDetector'
import StaticPoseDetector from './StaticPoseDetector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import * as tf from '@tensorflow/tfjs-core'

const App = () => {
  useEffect(() => {
    const waitForTF = async () => {
      await tf.ready()
      console.log('TF Ready')
    }
    waitForTF()
  }, [])

  return (
    <div className="m-5">
      <Tabs defaultValue="static" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="static">Static</TabsTrigger>
        </TabsList>
        <TabsContent value="detection">
          <LivePoseDetector />
        </TabsContent>
        <TabsContent value="static">
          <StaticPoseDetector />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
