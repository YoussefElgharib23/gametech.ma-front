module.exports = {
    apps: [
      {
        name: "gametech.ma",
        port: "3001",
        exec_mode: "cluster",
        instances: "max",
        script: "./.output/server/index.mjs",
      },
    ],
  };
  