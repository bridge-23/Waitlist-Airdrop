"use client";

import LeaderboardTab from "./LeaderboardTab";
import TasksTab from "./TasksTab";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <div className="body-background flex items-center justify-center min-h-screen">
      <Tabs defaultValue="task" className="w-full self-start">
        <TabsList className="grid w-full grid-cols-2 max-w-screen-md mx-auto mt-8">
          <TabsTrigger value="task">Tasks</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="task" className="w-full max-w-screen-xl mx-auto mt-8">
          <TasksTab />
        </TabsContent>
        <TabsContent
          value="leaderboard"
          className="w-full max-w-screen-xl mx-auto mt-8"
        >
          <LeaderboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
