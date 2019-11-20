import { Poll } from "./Poll";
import React, { useState, useEffect } from "react";
import uuid from "uuid/v4";

const Gun = require("gun/gun");

const getId = element => element["_"]["#"];

const useRerender = () => {
  const [, setRender] = useState({});
  const rerender = () => setRender({});
  return rerender;
};

const getSet = (data, id, key) => {
  if (!id) {
    throw new Error("No id defined");
  }
  const entity = data[id];
  if (!entity || !entity[key]) {
    return [];
  }
  const set = data[entity[key]["#"]];
  if (!set) {
    return [];
  }
  const arr = Object.keys(set)
    .filter(key => key !== "_")
    .map(key => set[key])
    .filter(Boolean)
    .map(ref => data[ref["#"]])
    .filter(Boolean);
  return arr;
};

export const GunPoll = ({ id }) => {
  const [gun, setGun] = useState(null);
  const rerender = useRerender();
  const [token, setToken] = useState();

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      token = uuid();
      localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  useEffect(() => {
    const gun = Gun({
      peers: ["https://gunjs.herokuapp.com/gun"]
    });
    setGun(gun);
  }, []);

  useEffect(() => {
    if (gun) {
      gun
        .get(id)
        .on(rerender)
        .get("answers")
        .map()
        .on(rerender)
        .get("votes")
        .on(rerender)
        .back()
        .get("comments")
        .map()
        .on(rerender);
    }
  }, [gun]);

  if (!gun || !token) {
    return <div>Loading...</div>;
  }

  const data = gun._.graph;
  console.log(data);
  const poll = {
    ...data[id],
    answers: getSet(data, id, "answers")
      .map(answer => {
        const res = {
          ...answer,
          votes: data[((answer || {}).votes || {})["#"]] || {},
          comments: getSet(data, getId(answer), "comments")
        };
        res.voteCount = Object.keys(res.votes)
          .filter(key => key !== "_")
          .map(key => res.votes[key])
          .filter(Boolean).length;
        console.log(res.votes, res.voteCount);
        return res;
      })
      .sort((a, b) => b.voteCount - a.voteCount)
  };

  return (
    <Poll
      getId={getId}
      poll={poll}
      id={id}
      token={token}
      onCreateAnswer={content =>
        gun
          .get(id)
          .get("answers")
          .set({
            content
          })
      }
      onCreateComment={(answerId, content) =>
        gun
          .get(answerId)
          .get("comments")
          .set({
            content
          })
      }
      onVote={(answerId, vote) => {
        console.log("the vote is", vote);
        gun
          .get(answerId)
          .get("votes")
          .get(token)
          .put(vote);
      }}
      onSetPollTitle={title =>
        gun
          .get(id)
          .get("title")
          .put(title)
      }
      onUpdateEvent={(id, values) => gun.get(id).put(values)}
    />
  );
};
