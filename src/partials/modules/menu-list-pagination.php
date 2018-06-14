<?php
$list_variant = isset($list_variant) ? " {$list_variant}" : "";
$list_links   = isset($list_links) ? $list_links : paginate_links(array("type" => "array"));
?>
<?php if ($list_links): ?>
    <nav class="menu-list_container<?php echo $list_variant; ?>">
        <ul class="menu-list -pagination -center">
            <?php foreach ($list_links as $link): ?>
                <?php
                // replace double quote with single quote for consistancy
                $link = preg_replace("/\"/", "'", $link);

                // add necessary classes
                $link = preg_replace("/class=('|\")/", "class='menu-list_link link ", $link);

                // change "current" class to match proper variant structure
                $link = preg_replace("/current/", "-current", $link);
                ?>

                <li class="menu-list_item">
                    <?php echo $link; ?>
                </li><!--/.menu-list_item-->
            <?php endforeach; ?>
        </ul><!--/.menu-list.-pagination.-center-->
    </nav><!--/.contenT_menu-list_container.menu-list_container-->
<?php endif; ?>