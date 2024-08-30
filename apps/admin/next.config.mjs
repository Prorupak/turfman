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

    // To get rid of "Can't resolve ..." errors which come from some wallet connector SDKs
    config.externals.push("pino-pretty", "lokijs", "encoding");

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
};

export default nextConfig;
