import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

import Page from "@/components/Page";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Popup from "@/components/layout/Popup";
import NavItem from "@/components/layout/NavItem";
import Banner from "@/components/blocks/Banner";
import Section from "@/components/structure/Section";
import Title from "@/components/blocks/Title";
import Card from "@/components/blocks/Card";
import IconItem from "@/components/blocks/IconItem";
import TableColumns from "@/components/blocks/TableColumns";
import TableColumn from "@/components/blocks/TableColumn";
import FlipCard from "@/components/blocks/FlipCard";
import Accordion from "@/components/blocks/Accordion";
import Carousel from "@/components/blocks/Carousel";
import Slide from "@/components/blocks/Slide";
import Box from "@/components/structure/Box";
import Container from "@/components/structure/Container";
import Row from "@/components/structure/Row";
import Col from "@/components/structure/Col";
import Colx from "@/components/structure/Colx";
import Text from "@/components/blocks/Text";
import Image from "@/components/blocks/Image";
import CardBox from "@/components/blocks/CardBox";
import Link from "@/components/blocks/LinkComponent";
import Button from "@/components/blocks/Button";
import List from "@/components/blocks/List";
import Login from "@/components/starter/Login";
import Register from "@/components/starter/Register";
import Feature from "@/components/starter/Feature";
import Grid from "@/components/starter/Grid";
import Teaser from "@/components/starter/Teaser";

// Content version to fetch: development (local dev server / Visual Editor
// preview) reads "draft", production builds read "published" so the live
// site only shows published content. Override with NEXT_PUBLIC_STORYBLOK_VERSION.
export const contentVersion: "draft" | "published" =
  (process.env.NEXT_PUBLIC_STORYBLOK_VERSION as "draft" | "published") ||
  (process.env.NODE_ENV === "development" ? "draft" : "published");

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_DELIVERY_API_TOKEN,
  use: [apiPlugin],
  components: {
    page: Page,
    login: Login,
    register: Register,
    header: Header,
    footer: Footer,
    banner: Banner,
    section: Section,
    title: Title,
    card: Card,
    icon_item: IconItem,
    table_columns: TableColumns,
    table_column: TableColumn,
    flip_card: FlipCard,
    accordion: Accordion,
    carousel: Carousel,
    slide: Slide,
    box: Box,
    popup: Popup,
    nav_item: NavItem,
    container: Container,
    row: Row,
    col: Col,
    colx: Colx,
    text: Text,
    image: Image,
    cardbox: CardBox,
    link: Link,
    button: Button,
    list: List,
    feature: Feature,
    grid: Grid,
    teaser: Teaser,
  },
  apiOptions: {
    /** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
    region: process.env.NEXT_PUBLIC_STORYBLOK_REGION || "eu",
    /** Only required when creating a Storyblok space directly via the Blueprints feature. */
    endpoint: process.env.STORYBLOK_API_BASE_URL
      ? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
      : undefined,
  },
});
