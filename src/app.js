import React, { useRef } from "react";
import { hot } from "react-hot-loader/root";
import { GunPoll } from "./components/GunPoll";
import uuid from "uuid/v1";

require("gun/lib/open");

const App = () => {
  const newId = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("poll");

  if (!id) {
    return (
      <div className="new-poll">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newId.current.value) {
              window.location.href = `${window.location.origin}?poll=${newId.current.value}`;
            }
          }}
        >
          <input ref={newId} placeholder="(New) poll ID e.g. tellmewhattodo" />
        </form>
        or
        <button
          onClick={e =>
            (window.location.href = `${window.location.origin}?poll=${uuid()}`)
          }
        >
          Create new poll with random ID
        </button>
      </div>
    );
  }

  return <GunPoll id={id} />;
};

export default hot(App);
