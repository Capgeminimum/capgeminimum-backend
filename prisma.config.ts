import "dotenv/config"
import {defineConfig} from "prisma/config";

const directUrl = process.env.DATABASE_URL;

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: directUrl,
    }
});
