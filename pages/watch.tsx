import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { useRouter } from "next/router";
import { Configuration, OpenAIApi } from "openai";
import ReactPlayer from "react-player";
import { default as sample } from "../sampleData/scores";

type Transcript = Array<{
  text: string;
  start: number;
  duration: number;
  zscore?: number;
}>;

const Watch: NextPage = ({
  scoredTranscript,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  // console.log(transcript);
  return (
    <div>
      <ReactPlayer
        url={`https://youtube.com/watch?v=${router.query.v}`}
        key={process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}
      />
      {JSON.stringify(scoredTranscript)}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const pyscript = spawn("python", [
    "./scripts/transcript.py",
    context.query.v as string,
  ]);

  const scoredTranscript = await onData(pyscript, openai);
  // console.log(scoredTranscript);

  return {
    props: {
      scoredTranscript,
    },
  };
};

function onData(process: ChildProcessWithoutNullStreams, openai: OpenAIApi) {
  return new Promise<Transcript>((resolve) => {
    process.stdout.once("data", async (data: Buffer) => {
      const transcript: Transcript = eval(data.toString());
      const scoredTranscript: Transcript = [];
      console.log("FIRE")
      for (let i = 0; i < transcript?.length; i += 200) {
        // 200 is the maximum number of documents allowed per query
        const slice = transcript.slice(i, i + 200);
        // extract the text property from slice
        const documents = slice.map(({ text }) => text);

        // const {
        //   // shorthand for response.data.data
        //   data: { data },
        // } = await openai.createSearch("babbage", {
        //   documents: documents,
        //   query: "language",
        // });

        // // calculate z scores and add to every object in the transcript slice, adding the slice to the returned transcript
        // const zscores = zscore(data!.map(({ score }) => score!));
        // slice.forEach((obj, i) => (obj.zscore = zscores[i]));
        // scoredTranscript.push(...slice);
      }
      console.log(scoredTranscript.length)
      // scoredTranscript.push(...sample);
      resolve(scoredTranscript);
    });
  });
}

/**
 * calculate the z-score of each score by normalizing with mean and standard deviation
 */
function zscore(scores: Array<number>) {
  const size = scores.length;
  const total = scores.reduce((acc, score) => acc + score, 0);
  const mean = total / size;

  const standardDeviation = Math.sqrt(
    scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / size
  );

  // might need to add by lowest value to start at zero for colors or smthn? idk
  const zscores = scores.map((score) => (score - mean) / standardDeviation);

  return zscores;
}

export default Watch;
