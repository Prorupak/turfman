// @ts-check
import CircularDependencyPlugin from "circular-dependency-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: process.env.TS_CONFIG_PATH,
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
            replaceAttrValues: { "#fff": "currentColor" },
          },
        },
      ],
    });

    if (!config.plugins) config.plugins = [];
    if (process.env.VERCEL_ENV === "production") {
      config.plugins.push(
        new CircularDependencyPlugin({
          exclude: /.next|node_modules/,
          include: /src/,
          // TODO: if all circular dependencies are resolved, set this argument to true
          failOnError: false,
          allowAsyncCycles: false,
        }),
      );
    }

    return config;
  },
  productionBrowserSourceMaps: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
