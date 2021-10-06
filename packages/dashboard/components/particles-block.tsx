/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { useTheme, darken, lighten } from "@mui/material/styles";
import Particles from "react-tsparticles";

export const ParticlesBlock = ({ sx, children }: any) => {
  const theme = useTheme();
  const height = sx?.height || "600px";

  const isDarkMode = theme.palette.mode === "dark";
  const modeStyles = isDarkMode
    ? {
        backgroundImage: `url('./assets/overdrive-dark.svg')`,
        backgroundColor: "rgba(21, 23, 38, .9)",
        backgroundBlendMode: "darken",
      }
    : {
        backgroundImage: `url('./assets/overdrive-light.svg')`,
        backgroundColor: "rgba(232, 234, 246, .5)",
        backgroundBlendMode: "overlay",
      };

  const graphColor = isDarkMode
    ? darken("#594aa8", 0.5)
    : lighten("#594aa8", 0.7);
  const options = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 600,
        },
      },
      color: {
        value: graphColor,
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
        polygon: {
          nb_sides: 5,
        },
        image: {
          src: "img/github.svg",
          width: 100,
          height: 100,
        },
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 6,
        random: true,
        anim: {
          enable: false,
          speed: 80,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 100,
        color: graphColor,
        opacity: 0.4,
        width: 2,
      },
      move: {
        enable: true,
        speed: 0.25,
        direction: "top",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "bubble",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 100,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 100,
          size: 30,
          duration: 2,
          opacity: 0.8,
          speed: 3,
        },
        repulse: {
          distance: 400,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
  };

  return (
    <div
      style={{
        height,
        width: "100%",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "none",
        ...modeStyles,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "70%",
            margin: "auto",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          {children}
        </div>
      </div>
      <Particles {...sx} height={height} options={options} />
    </div>
  );
};
