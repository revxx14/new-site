<?php
/* ------------------------------------------------------------------------ *\
 * Page Speed
\* ------------------------------------------------------------------------ */

// remove version strings
function new_site_remove_script_version($src) {
    $parts = explode("?ver", $src);
    return $parts[0];
}
add_filter("script_loader_src", "new_site_remove_script_version", 15, 1);
add_filter("style_loader_src", "new_site_remove_script_version", 15, 1);

// disable oEmbed
function speed_stop_loading_wp_embed() {
    if (!is_admin()) {
        wp_deregister_script("wp-embed");
    }
}
add_action("init", "speed_stop_loading_wp_embed");

// disable Emoji
remove_action("wp_head", "print_emoji_detection_script", 7);
remove_action("wp_print_styles", "print_emoji_styles");

/* ------------------------------------------------------------------------ *\
 * Theme Features
\* ------------------------------------------------------------------------ */

add_theme_support("html5", array(
    "comment-list",
    "comment-form",
    "search-form",
    "gallery",
    "caption"
));

add_theme_support("custom-logo", array(
    "height"      => 45,
    "width"       => 200,
    "flex-height" => true,
    "flex-width"  => true,
    "header-text" => array("site-title", "site-description"),
));

add_theme_support("title-tag");

add_theme_support("automatic-feed-links");

add_theme_support("post-thumbnails");


/* ------------------------------------------------------------------------ *\
 * Menus
\* ------------------------------------------------------------------------ */

// register the menus
register_nav_menus(array(
	"primary" => "Navigation",
));

// menu walker
class new_site_walker extends Walker_Nav_Menu {
    // set up a variable to hold the parameters passed to the walker
    private $params;

    // store the paramters in an accessible way
    public function __construct($params = "") {
        $this->params = $params;
    }

    // set up mega menu classes
	private $column_limit = 3;
	private $column_count = 0;
    static $li_count = 0;

    function display_element ($element, &$children_elements, $max_depth, $depth = 0, $args, &$output) {
        if (isset($children_elements[$element->ID]) && !empty($children_elements[$element->ID])) {
            $i = 0;

            foreach ($children_elements[$element->ID] as $child) {
                $has_columns = get_post_meta($child->ID, "_menu_item_column");
                $parent_id = get_post_meta($child->ID, "_menu_item_menu_item_parent");

                $i++;

                if ($i > 1) {
                    if (intval($has_columns[0]) === 1 && intval($parent_id[0]) === $element->ID) {
                        array_push($element->classes, "-mega");
                        break;
                    }
                }
            }

        }

        return parent::display_element($element, $children_elements, $max_depth, $depth, $args, $output);
    }

    public function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        // convert the params in to an array
        $params = explode(" ", $this->params);

        // get the current classes
        $classes = $item->classes ? $item->classes : array();

        // add the menu-list_item class if the classes array contains menu-item
        if (in_array("menu-item", $classes))
            array_push($classes, "menu-list_item");

        // add the is-viewed class if the page is currently be viewed
        if (in_array("current_page_item", $classes))
            array_push($classes, "is-viewed");

        // add the is-viewed class if the page is currently be viewed
        if (in_array("current_page_item", $classes))
            array_push($classes, "is-viewed");

        // add a the -parent class if the page has children
        if (in_array("menu-item-has-children", $classes))
            array_push($classes, "-parent");

        // convert the clean_classes array in to usable string
        $class_names = " class='" . esc_attr(join(" ", apply_filters("nav_menu_css_class", array_filter($classes), $item))) . "'";

        // retrieve the URL
        $url = $item->url;

        // retrieve and sanitize the title attribute
        $attr_title = $item->attr_title ? " title='" . htmlentities($item->attr_title, ENT_QUOTES) . "'" : "";

        // retrieve the target
        $target = $item->target ? " target='{$item->target}'" : "";

        // retrieve and sanitize the rel attribute
        $xfn = $item->xfn ? " rel='" . htmlentities($item->xfn, ENT_QUOTES) . "'" : "";

        // retrieve the title
        $title = $item->title;

        // retrieve and sanitize the description
        $description = $item->description ? " <span class='menu-item_description'>" . htmlentities($item->description, ENT_QUOTES) . "</span>" : "";

        // construct the menu item
        $output .= sprintf(
            "<li%s><a class='menu-list_link' href='%s'%s%s%s>%s</a>",
            $class_names,
            $url,
            $attr_title,
            $target,
            $xfn,
            $title,
            $description
        );

        /* mega menu stuff */

        if (in_array("mega", $params)) {
            if (in_array("-mega", $classes)) {
                $output .= "<div class='menu-container -mega'>";
            }

            if ($depth === 0) {
    			self::$li_count = 0;
    		}

    		if ($depth === 1 && self::$li_count === 1) {
    			$this->column_count++;
    		}

            if ($depth === 1 && get_post_meta($item->ID, "_menu_item_column", true) && self::$li_count !== 1 && $this->column_count < $this->column_limit) {
                $output .= "</ul><ul class='menu-list -vertical -child -tier1' aria-hidden='true'>";
    			$this->column_count++;
            }

            self::$li_count++;
        }
    }

    public function start_lvl(&$output, $depth = 0, $args = array()) {
        // convert the params in to an array
        $params = explode(" ", $this->params);

        // add a toggle button if the buttons paramater is passed
        $toggle = in_array("accordion", $params) ? "<button class='menu-list_toggle'><i class='fa fa-chevron-down'></i><span class='_visuallyhidden'>" . __("Click to toggle children", "new_site") . "</span></button>" : "<button class='menu-list_toggle _visuallyhidden'>" . __("Click to toggle children", "new_site") . "</button>";

        // add a -tier class indicting the depth
        $variant = "-tier1";

        if ($depth > 0) {
            if ($depth > 1) {
                $variant = "-tier" . ($depth + 1);
            } else {
                $variant = "-tier2";
            }
        }

        // add a -accordion class if the accordion parameter is passed
        $variant .= in_array("accordion", $params) ? " -accordion" : " -overlay";

        // construct the menu list
        $output .= "{$toggle}<ul class='menu-list -vertical -child {$variant}' aria-hidden='true'>";
    }

    public function end_lvl(&$output, $depth = 0, $args = array()) {
        // close the menu list
        $output .= "</ul>";
    }

    public function end_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        // convert the params in to an array
        $params = explode(" ", $this->params);

        /* mega menu stuff */

        if (in_array("mega", $params)) {
            // get the current classes
            $classes = $item->classes ? $item->classes : array();

            if (in_array("-mega", $classes)) {
                $output .= "</div>";
            }
        }

        // close the menu item
        $output .= "</li>";
    }
}

// add "Start New Column" checkboxes to the editor for a mega menu
if (is_admin()) {
    // @TODO figure out how to only do this on the menu editor page
    // require nav-menu.php so we can hook Walker_Nav_Menu_Edit
    require_once ABSPATH . "wp-admin/includes/nav-menu.php";

    class new_site_mega_menu_column_checkbox_setup extends Walker_Nav_Menu_Edit {
        static $field = array("name" => "column");

        // add a new checkbox to each menu item
        function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
            $item_output = "";

            // get the parent item
            parent::start_el($item_output, $item, $depth, $args);

            self::$field["value"] = get_post_meta($item->ID, "_menu_item_" . self::$field["name"], true);
            self::$field["checked"] = "value='1' " . checked(self::$field["value"], 1, false);

            $new_field = "<p class='field-" . self::$field["name"] . " description'><label for='edit-menu-item-" . self::$field["name"] . "-{$item->ID}'>";
            $new_field .= "<input type='checkbox' id='edit-menu-item-" . self::$field["name"] . "-{$item->ID}' class='widefat code edit-menu-item-" . self::$field["name"] . "' name='menu-item-" . self::$field["name"] . "[{$item->ID}]'" . self::$field["checked"] . " />";
            $new_field .= __("Start new column here", "new_site");
            $new_field .= "</label></p>";

            $output .= preg_replace("/(?=<p[^>]+class=\"[^\"]*field-css-classes)/", $new_field, $item_output);
        }

        // function to save the new field
        static function _save_post($post_id) {
            if (get_post_type($post_id) !== "nav_menu_item") {
                return;
            }

            $form_field_name = "menu-item-" . self::$field["name"];
            $key = "_menu_item_" . self::$field["name"];
            $value = isset($_POST[$form_field_name][$post_id]) ? stripslashes($_POST[$form_field_name][$post_id]) : "";

            update_post_meta($post_id, $key, $value);
        }

        // add the save function to the save_post action
        static function setup() {
            add_action("save_post", array(__CLASS__, "_save_post"));
        }
    }
    add_action("init", array("new_site_mega_menu_column_checkbox_setup", "setup"));
    add_filter("wp_edit_nav_menu_walker", function () {
        return "new_site_mega_menu_column_checkbox_setup";
    });

    // hide the checkbox except on depth 1
    function new_site_hide_column_checkbox_except_on_depth_1() {
        $current_screen = get_current_screen();

        if ($current_screen->base === "nav-menus") {
            echo "<style>.menu-item:not(.menu-item-depth-1) .field-column, .menu-item.menu-item-depth-0 + .menu-item.menu-item-depth-1 .field-column {display:none;}</style>";
        }
    }
    add_action("admin_head", "new_site_hide_column_checkbox_except_on_depth_1");
}

/* ------------------------------------------------------------------------ *\
 * Styles & Scripts
\* ------------------------------------------------------------------------ */

// enqueue styles & scripts
function new_site_enqueue_scripts() {
    wp_enqueue_script("jquery");
}
add_action("wp_enqueue_scripts", "new_site_enqueue_scripts");

/* ------------------------------------------------------------------------ *\
 * Image Sizes
\* ------------------------------------------------------------------------ */

add_image_size("hero", 700, 400, true);
add_image_size("hero_medium", 1200, 400, true);
add_image_size("hero_large", 2000, 400, true);

/* ------------------------------------------------------------------------ *\
 * Filters
\* ------------------------------------------------------------------------ */

// remove dimensions from thumbnails
function new_site_remove_thumbnail_dimensions($html, $post_id, $post_image_id) {
    $html = preg_replace('/(width|height)=\"\d*\"\s/', "", $html);
    return $html;
}
add_filter("post_thumbnail_html", "new_site_remove_thumbnail_dimensions", 10, 3);

// add data attributes to tables
function new_site_responsive_tables($content) {
    // @TODO write filter :)

    return $content;
}
add_filter("the_content", "new_site_responsive_tables", 10, 2);
add_filter("acf_the_content", "new_site_responsive_tables", 10, 2);

// disable Ninja Forms styles
function new_site_dequeue_nf_display() {
    wp_dequeue_style("nf-display");
}
add_action("ninja_forms_enqueue_scripts", "new_site_dequeue_nf_display", 999);

/* ------------------------------------------------------------------------ *\
 * Custom Functions
\* ------------------------------------------------------------------------ */

// get a nicer excerpt based on post ID
function get_better_excerpt($id = 0, $length = 55, $more = " [...]") {
    global $post;

    $post_id = $id ? $id : $post->ID;
    $post_object = get_post($post_id);
    $excerpt = $post_object->post_excerpt ? $post_object->post_excerpt : wp_trim_words(strip_shortcodes($post_object->post_content), $length, $more);

    return $excerpt;
}

/* ------------------------------------------------------------------------ *\
 * Advanced custom Fields
\* ------------------------------------------------------------------------ */

// Start Front Page Slideshow
if( function_exists('acf_add_local_field_group') ):

acf_add_local_field_group(array (
	'key' => 'group_5788edcaf258b',
	'title' => 'Front Page Slideshow',
	'fields' => array (
		array (
			'key' => 'field_5788edcf43a44',
			'label' => 'Slideshow',
			'name' => 'slideshow',
			'type' => 'repeater',
			'instructions' => '',
			'required' => 0,
			'conditional_logic' => 0,
			'wrapper' => array (
				'width' => '',
				'class' => '',
				'id' => '',
			),
			'collapsed' => '',
			'min' => '',
			'max' => '',
			'layout' => 'block',
			'button_label' => 'Add Image',
			'sub_fields' => array (
				array (
					'key' => 'field_5788edd543a45',
					'label' => 'Image',
					'name' => 'image',
					'type' => 'image',
					'instructions' => '',
					'required' => 1,
					'conditional_logic' => 0,
					'wrapper' => array (
						'width' => '',
						'class' => '',
						'id' => '',
					),
					'return_format' => 'array',
					'preview_size' => 'hero_medium',
					'library' => 'all',
					'min_width' => '',
					'min_height' => '',
					'min_size' => '',
					'max_width' => '',
					'max_height' => '',
					'max_size' => '',
					'mime_types' => '',
				),
			),
		),
	),
	'location' => array (
		array (
			array (
				'param' => 'page_type',
				'operator' => '==',
				'value' => 'front_page',
			),
		),
	),
	'menu_order' => 0,
	'position' => 'acf_after_title',
	'style' => 'seamless',
	'label_placement' => 'top',
	'instruction_placement' => 'label',
	'hide_on_screen' => '',
	'active' => 1,
	'description' => '',
));

endif;
// End Front Page Slideshow
