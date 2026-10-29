import { connection } from "next/server";
import { StoryblokStory } from "@storyblok/react/rsc";
import { getStoryblokApi, contentVersion } from "@/lib/storyblok";

/** CMS-driven page; opt out of instant prerendering until data is cached. */
export const instant = false;

// Global config stories are consumed by the layout (header, popup) and have
// no page output of their own.
const GLOBAL_STORY_COMPONENTS = new Set(["header", "popup"]);

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  await connection();
  const { slug } = await params;

  const fullSlug = slug ? slug.join("/") : "home";

  let story = null;
  let errorMessage = "";
  try {
    const storyblokApi = getStoryblokApi();
    const { data } = await storyblokApi.get(`cdn/stories/${fullSlug}`, {
      version: contentVersion,
    });
    story = data.story;
  } catch (error) {
    console.error(
      `Storyblok error for slug "${fullSlug}":`,
      error instanceof Error ? error.message : error,
    );
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  if (!story) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Storyblok Content Not Found</h1>
        <p>
          Slug: <strong>{fullSlug}</strong>
        </p>
        <p style={{ marginTop: "1rem" }}>
          Please create this story in your Storyblok space,
          <br />
          or use the Storyblok Visual Editor to create content.
        </p>
        <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Error: {errorMessage}
        </p>
      </div>
    );
  }

  if (GLOBAL_STORY_COMPONENTS.has(story.content?.component)) {
    return null;
  }

  return <StoryblokStory story={story} />;
}
