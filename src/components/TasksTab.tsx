import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Clipboard, Square, SquareRadical, Twitter } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import Image from "next/image";
import { useToast } from "./ui/use-toast";
import { fetchAccount, fetchPointsList, fetchTwitterFollowed, fetchDiscordJoined } from "@/app/actions";
import { savePrincipalId } from "@/app/actions";
import TwitterButton from "./ui/twitterButton";
import DiscordButton from "./ui/discordButton";
import { generateShareText } from "@/utils/share/share";


const COPY_BTN_TEXT = "Copy ref link";


export default function TasksTab() {
  const [buttonText, setButtonText] = useState(COPY_BTN_TEXT);
  const [isTwitterFollowed, setIsTwitterFollowed] = useState(false);
  const [isDiscordJoined, setIsDiscordJoined] = useState(false);
  const [isPlugWalletConnected, setIsPlugWalletConnected] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [userData, setUserData] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pointsList, setPointsList] = useState<PointList[] | null>(null)
  const { toast } = useToast();

  // copy to clipboard
  const copyToClipboard = async () => {
    const link = document.getElementById("link-input") as HTMLInputElement;
    await navigator.clipboard.writeText(link.value);
    setButtonText("Copied!");
    setTimeout(() => setButtonText(COPY_BTN_TEXT), 3000);
  };

  const refreshTwitterFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterFollowed();
      setIsTwitterFollowed(!!followed);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDiscordJoinStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchDiscordJoined();
      setIsDiscordJoined(!!joined);
    } finally {
      setIsLoading(false);
    }
  }

  const isPlugWalletAvailable = () => {
    return window.ic && window.ic.plug;
  };

  const connectPlugWallet = async () => {
    if (isPlugWalletAvailable()) {
      setIsLoading(true);
      try {
        await window.ic.plug.requestConnect();
        const principalId = window.ic.plug.principalId;
        const success = await savePrincipalId(principalId.toString());
        if (success) {
          toast({
            title: "Success",
            description: "Your Plug wallet has been successfully connected 🥳",
          });
          setIsPlugWalletConnected(true);
        }
      } catch (error) {
        console.error("Plug Wallet connection error:", error);
        toast({
          title: "Error",
          description: "Failed to connect your Plug wallet.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Plug Wallet is not available.");
      toast({
        title: "Unavailable",
        description: "Plug wallet is not available. Please install Plug wallet to connect.",
      });
    }
  };

  // setup the share text

  const shareText = `I just signed up for the @galaxydoxyz waitlist!

  1. All-in-one canvas workspace
  2. Create and manage your knowledge
  3. Own & Monetize on Blockchain
  
  Use my referral code to join the waitlist & earn bonus points for an airdrop: https://waitlist.galaxydo.xyz/?invite_code=${userData?.invitation_code}`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent('Galaxy.do')}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };


  useEffect(() => {
    setIsLoading(true);
    const loadData = async () => {
      const fetchUser = await fetchAccount();
      const fetchedPointsList = await fetchPointsList();
      setPointsList(fetchedPointsList);
      setUserData(fetchUser);
      setIsTwitterFollowed(fetchedPointsList?.some(point => point.note === "Follow Galaxy.do on Twitter") || false);
      setIsDiscordJoined(fetchedPointsList?.some(point => point.note === "Joined Discord Galaxy.do") || false);
      setIsPlugWalletConnected(fetchUser?.principal_id ? true : false);
    };
    loadData().finally(() => {
      setIsLoading(false);
    });
    if (isPlugWalletConnected || isTwitterFollowed) {
      loadData();
    }
  }, [isPlugWalletConnected, isTwitterFollowed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <Card className="">
      <CardContent className="p-0">
        <div className="md:hidden">
          <div className="py-6 px-4">
            <div className="flex justify-left items-center">
              <CardTitle>
                You have earned {userData?.total_points} points 🎉
              </CardTitle>
              <Button onClick={() => setShowPoints(!showPoints)} className="ml-4 hover:bg-[#601c87] points:bg-[#9920e9] text-white">
                {showPoints ? 'Hide Points' : 'Show Points'}
              </Button>
            </div>
            {showPoints && (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Points</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsList?.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>{point.amount}</TableCell>
                      <TableCell>{point.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 md:border-r border-border px-4 py-6">
            <CardTitle>Invite People to get more points!</CardTitle>
            <CardDescription className="mt-2">
              Share referral link with your friends and earn points
            </CardDescription>
            <CardDescription className="mt-1">
              You will earn <strong>250 points</strong> for each referred friend
              + <strong>20%</strong> of their points
            </CardDescription>
            <div className="flex w-full max-w-md items-center justify-start space-x-2 my-5">
              <Input
                id="link-input"
                type="text"
                defaultValue={`https://waitlist.galaxydo.xyz/?invite_code=${userData?.invitation_code}`}
                readOnly
                className="text-center hover:bg-[#601c87]"
              />
              <Button type="button" onClick={copyToClipboard} variant={"reflink"}>
                <Clipboard size={16} className="mr-2" />
                {buttonText}
              </Button>
            </div>
            <Button size={"sm"} variant={"specialAction"} className="mr-2 mb-2 share:bg-[#420764] hover:bg-[#601c87]" onClick={shareOnTwitter}>
              <Image src="/images/twitter.png" alt="twitter" width={20} height={20} className="mr-2" />
              Share on Twitter
            </Button>
            <Button size={"sm"} variant={"specialAction"} className="share:bg-[#420764] hover:bg-[#601c87]" onClick={shareOnTelegram}>
              <Image src="/images/telegram.png" alt="Telegram" width={20} height={20} className="mr-2" />
              Share on Telegram
            </Button>
            <div className="md:col-span-2 md:row-start-2 col-start-1 row-start-3 ">
              <div>
                <CardTitle className="mt-16">
                  Complete tasks below to earn even more points!
                </CardTitle>
                <Table className="w-full mt-4">
                  <TableHeader>
                    <TableRow className="hover:bg-[#601c87]">
                      <TableHead className="w-16"></TableHead>
                      <TableHead>TASK</TableHead>
                      <TableHead>POINTS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-[#601c87]">
                      <TableCell>
                        <Checkbox className="w-5 h-5 rounded-[4px]" checked />
                      </TableCell>
                      <TableCell>Sign up for the waitlist with Twitter</TableCell>
                      <TableCell>+100 points</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#601c87]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isTwitterFollowed}
                        />
                      </TableCell>
                      <TableCell>
                        <TwitterButton
                          isDisabled={isTwitterFollowed}
                          onFollowSuccess={refreshTwitterFollowStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isTwitterFollowed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#601c87]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isDiscordJoined}
                        />
                      </TableCell>
                      <TableCell>
                        <DiscordButton
                          isDisabled={isDiscordJoined}
                          onFollowSuccess={refreshDiscordJoinStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isDiscordJoined ? 'text-foreground' : 'text-muted-foreground'}`}>
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#601c87]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          checked={isPlugWalletConnected}
                          onClick={(e) => e.preventDefault()}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          className="text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
                          onClick={() => connectPlugWallet()}
                          disabled={isPlugWalletConnected}
                          variant={"specialAction"}
                        >
                          <Image
                            src="/images/plag_wallet_logo.png"
                            alt="Plag Wallet"
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          <span>Connect Plug Wallet</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isPlugWalletConnected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          + 200 points
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="hidden md:block md:py-6">
            <CardTitle className="px-4 pb-4">
              You have earned {userData?.total_points} points 🎉
            </CardTitle>
            <CardDescription className="px-4 pb-4">
              Total referrals: {userData?.invited_accounts_count}
            </CardDescription>
            <Separator className="mt-2" />
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-[#601c87]">
                  <TableHead>Points</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsList?.map((point, index) => (
                  <TableRow key={index} className="hover:bg-[#601c87]">
                    <TableCell>{point.amount}</TableCell>
                    <TableCell>{point.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
