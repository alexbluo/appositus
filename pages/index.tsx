import { useState, ChangeEvent, FormEvent } from "react";
import type { NextPage } from "next";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import ReactPlayer from "react-player/youtube";
import Head from "next/head";
import Image from "next/image";
import "../styles/Home.module.scss";

const Home: NextPage = () => {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [isValidLink, setIsValidLink] = useState(false);
  
  function handleLinkInput(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setLink(value);

    setIsValidLink(
      !!value.match(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
      )
    );
  }

  async function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidLink) return;

    // get video id from url query params
    const params = new URL(link).searchParams;
    const videoID = params.get("v");

    // redirect if link is valid and video exists
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
    );
    if (res.data.items.length !== 0) {
      router.push(`/watch?v=${videoID}`);
    } else {
      setIsValidLink(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column align-items-center justify-content-center w-100 vh-100">
        <div className="w-25">
          <form
            className="input-group w-100"
            autoComplete="off"
            onSubmit={handleLinkSubmit}
          >
            <input
              className="form-control"
              type="form"
              placeholder="youtube.com/watch?v=id"
              aria-label="Video Link"
              aria-describedby="button-addon1"
              onChange={handleLinkInput}
            />
            <button className="btn btn-primary" type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-return-right"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"
                />
              </svg>
            </button>
          </form>
          {!isValidLink && <label className="text-danger">Invalid link</label>}
        </div>
      </div>
    </div>
  );
};

export default Home;
