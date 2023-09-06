import onError from "@/lib/api/handleError";
import createHttpError from "http-errors";
import { z } from 'zod';

import pluginCaetgory from "@/lib/services/plugin/pluginCategory";
import pluginAuthors from "@/lib/services/plugin/pluginAuthors";
import pluginReports from '@lib/services/plugin/pluginReports';
import pluginImages from '@/lib/services/plugin/pluginImages';
import pluginSquare from '@lib/services/plugin/pluginSquare';
import pluginFlags from "@/lib/services/plugin/pluginFlags";
import pluginMail from '@/lib/services/plugin/pluginMail';
import pluginUser from '@lib/services/plugin/pluginUser';
import pluginTAC from '@lib/services/plugin/pluginTAC';

const vaildGet = z.enum([
    "authors",
    "reports",
    "category",
    "flags",
    "mail",
    "tac",
    "users",
    "images"]);

const vaildPut = z.enum(["flags"]);

const vaildDelete = z.enum([
    "authors",
    "reports",
    "category",
    "mail",
    "users",
    "images"]);

const vaildPatch = z.enum([
    "authors",
    "category",
    "tac", "users"]);

const vaildPost = z.enum([
    "authors",
    "square",
    "category",
    "mail",
    "users"]);

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        const authorization = request.headers.get("authorization");
        if (!authorization || authorization.replace("Bearer ", "") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();

        const route = vaildGet.parse(params.slug);

        switch (route) {
            case "authors":
                return pluginAuthors.GET(request);
            case "reports":
                return pluginReports.GET(request);
            case "category":
                return pluginCaetgory.GET(request);
            case "flags":
                return pluginFlags.GET();
            case "mail":
                return pluginMail.GET(request);
            case "users":
                return pluginUser.GET(request);
            case "tac":
                return pluginTAC.GET(request);
            case "images":
                return pluginImages.GET(request);
        }

    } catch (error) {
        return onError(error);
    }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
    try {
        const authorization = request.headers.get("authorization");
        if (!authorization || authorization.replace("Bearer ", "") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();
        const route = vaildPost.parse(params.slug);

        switch (route) {
            case "authors":
                return pluginAuthors.POST(request);
            case "square":
                return pluginSquare.POST(request);
            case "category":
                return pluginCaetgory.POST(request);
            case "mail":
                return pluginCaetgory.POST(request);
        }


    } catch (error) {
        return onError(error);
    }
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
    try {
        const authorization = request.headers.get("authorization");
        if (!authorization || authorization.replace("Bearer ", "") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();
        const route = vaildPatch.parse(params.slug);

        switch (route) {
            case "tac":
                return pluginTAC.PATCH(request);
            case "authors":
                return pluginAuthors.PATCH(request)
            case "category":
                return pluginCaetgory.PATCH(request);
            case "users":
                return pluginUser.PATCH(request);
        }

    } catch (error) {
        return onError(error);
    }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
    try {
        const authorization = request.headers.get("authorization");
        if (!authorization || authorization.replace("Bearer ", "") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();
        const route = vaildDelete.parse(params.slug);

        switch (route) {
            case "authors":
                return pluginAuthors.DELETE(request);
            case "reports":
                return pluginReports.DELETE(request);
            case "category":
                return pluginCaetgory.DELETE(request);
            case "mail":
                return pluginMail.DELETE(request);
            case "users":
                return pluginUser.DELETE(request);
            case "images":
                return pluginImages.DELETE(request);
        }

    } catch (error) {
        return onError(error);
    }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
    try {
        const authorization = request.headers.get("authorization");
        if (!authorization || authorization.replace("Bearer ", "") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();
        const route = vaildPut.parse(params.slug);

        switch (route) {
            case "flags": {
                return pluginFlags.PUT(request);
            }
        }

    } catch (error) {
        return onError(error);
    }
}