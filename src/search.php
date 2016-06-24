<?php get_header(); ?>
            <div class="content-container">
                <main class="content-block">
                    <div class="row">
                        <div class="col">
                            <div class="content_post">
                                <?php
                                // display breadcrumbs
                                if (function_exists("yoast_breadcrumb")) {
                                    yoast_breadcrumb("<nav class='breadcrumb-menu'><p class='breadcrumb-text text'>", "</p></nav>");
                                }
                                ?>
                                <div class="article">
                                    <header class="article_header">
                                        <?php get_search_form(); ?>
                                    </header><!--/.header-->
                                    <div class="article_content">
                                        <?php
                                        // check if posts exist
                                        if (have_posts()) {
                                            // loop through each post
                                            while (have_posts()) {
                                                // iterate the post index
                                                the_post();

                                                // open an article
                                                echo "<article class='article -excerpt'>";

                                                // display the image
                                                if (has_post_thumbnail()) {
                                                    echo "<figure class='article_figure'><a class='article_link link' href='" . get_permalink() . "'>" . get_the_post_thumbnail($post->ID, "medium", array("class" => "article_image")) . "</a></figure>";
                                                }

                                                // open a header
                                                echo "<header class='article_header'>";

                                                // display the title
                                                echo "<h2 class='article_title title -sub'><a class='article_link link' href='" . get_permalink() . "'>" . get_the_title() . "</a></h2>";

                                                // display the meta information
                                                if (get_post_type() == "post") {
                                                    // open a menu-wrapper and menu-list
                                                    echo "<nav class='article-menu-container menu-container'><ul class='article-menu-list menu-list -meta'>";

                                                    // display the date posted
                                                    echo "<li class='article-menu-list_item menu-list_item'><a class='article-menu-list_link menu-list_link link' href='" . get_the_permalink() . "'><i class='fa fa-clock-o'></i> " . get_the_date() . "</a></li>";

                                                    // get the category list
                                                    $category_list = false;
                                                    ob_start();
                                                    get_the_category_list(", ");
                                                    $category_list = ob_get_contents();
                                                    ob_end_clean();

                                                    // display the category list
                                                    if ($category_list) {
                                                        echo "<li class='article-menu-list_item menu-list_item'><i class='fa fa-folder'></i> " . preg_replace("/<a/im", "<a class='menu-list_link link'", $category_list) . "</li>";
                                                    }

                                                    // get the tag list
                                                    $tag_list = false;
                                                    ob_start();
                                                    the_tags("<li class='article-menu-list_item menu-list_item'><i class='fa fa-tags'></i> ", ", ", "</li>");
                                                    $tag_list = ob_get_contents();
                                                    ob_end_clean();

                                                    // display the tag list
                                                    if ($tag_list) {
                                                        echo preg_replace("/<a/im", "<a class='menu-list_link link'", $tag_list);
                                                    }

                                                    // display the comment count
                                                    if (comments_open() || get_comments_number() > 0) {
                                                        // get the comments link
                                                        $comments_link = false;
                                                        ob_start();
                                                        comments_popup_link("<i class='fa fa-comment-o'></i> No Comments", "<i class='fa fa-comment'></i> 1 Comment", "<i class='fa fa-comments'></i> % Comments");
                                                        $comments_link = ob_get_contents();
                                                        ob_end_clean();

                                                        // display the comments link
                                                        if ($comments_link) {
                                                            echo "<li class='article-menu-list_item menu-list_item'>" . preg_replace("/<a/im", "<a class='menu-list_link link'", $comments_link) . "</li>";
                                                        }
                                                    }

                                                    // close the article-menu-list and article-menu-container
                                                    echo "</ul></nav>";
                                                }

                                                // close the article_header
                                                echo "</header>";

                                                // display the post excerpt
                                                $post_excerpt = $post->post_excerpt ? $post->post_excerpt : wp_trim_words($post->post_content, 55) . " [...]";
                                                echo "<div class='article_content'><p class='article-text text'>{$post_excerpt}</p></div>";

                                                // close the article
                                                echo "</article>";
                                            }

                                        } else {
                                            echo "<p class='search-text text'>" . __("No results found for ", "new_site") . "<strong>" . get_search_query() . "</strong>.</p>";
                                        }
                                        ?>
                                    </div><!--/.content-->
                                    <?php
                                    // display the pagination links
                                    if (get_adjacent_post(false, "", false) || get_adjacent_post(false, "", true)) {
                                        echo "<footer class='pagination-menu'><p class='pagination-text text'>";
                                        if (get_adjacent_post(false, "", false)) {
                                            previous_posts_link("<i class='fa fa-caret-left'></i> Previous Page");
                                        }
                                        if (get_adjacent_post(false, "", true)) {
                                            next_posts_link("Next Page <i class='fa fa-caret-right'></i>");
                                        }
                                        echo "</p></footer>";
                                    }
                                    ?>
                                </div><!--/.article-->
                            </div><!--/.content_post-->
                        </div><!--/.col-->
                        <?php get_sidebar(); ?>
                    </div><!--/.row-->
                </main><!--/.content-block-->
            </div><!--/.content-container-->
<?php get_footer(); ?>
