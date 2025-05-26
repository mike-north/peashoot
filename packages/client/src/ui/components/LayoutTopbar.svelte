<script lang="ts">
</script>

<div
  role="navigation"
  aria-label="Navbar"
  class="flex items-center justify-between px-3"
  id="layout-topbar"
>
  <div class="inline-flex items-center gap-3">
    <label
      class="btn btn-square btn-ghost btn-sm"
      aria-label="Leftmenu toggle"
      for="layout-sidebar-toggle-trigger"
    >
      <span class="iconify lucide--menu size-5"></span>
    </label>


  </div>
  <div class="inline-flex items-center gap-1.5">
    <div class="dropdown dropdown-center">
      <div
        tabindex="0"
        role="button"
        class="btn btn-sm btn-circle btn-ghost"
        aria-label="Theme toggle"
      >
        <span
          class="iconify lucide--sun hidden size-4 size-4.5 group-data-[theme=light]/html:inline"
        ></span>
        <span
          class="iconify lucide--moon hidden size-4 size-4.5 group-data-[theme=dark]/html:inline"
        ></span>
        <span
          class="iconify lucide--monitor hidden size-4 size-4.5 group-[:not([data-theme])]/html:inline"
        ></span>
        <span
          class="iconify lucide--palette hidden size-4 size-4.5 group-data-[theme=contrast]/html:inline group-data-[theme=dim]/html:inline group-data-[theme=material]/html:inline group-data-[theme=material-dark]/html:inline"
        ></span>
      </div>
      <ul
        class="dropdown-content menu bg-base-100 rounded-box z-1 mt-2 w-36 space-y-0.5 p-1 shadow-sm"
      >
        <li>
          <div
            class="group-data-[theme=light]/html:bg-base-200 flex gap-2"
            data-theme-control="light"
          >
            <span class="iconify lucide--sun size-4.5"></span>
            <span class="font-medium">Light</span>
          </div>
        </li>
        <li>
          <div
            class="group-data-[theme=dark]/html:bg-base-200 flex gap-2"
            data-theme-control="dark"
          >
            <span class="iconify lucide--moon size-4.5"></span>
            <span class="font-medium">Dark</span>
          </div>
        </li>
        <li>
          <div
            class="group-[:not([data-theme])]/html:bg-base-200 flex gap-2"
            data-theme-control="system"
          >
            <span class="iconify lucide--monitor size-4.5"></span>
            <span class="font-medium">System</span>
          </div>
        </li>
      </ul>
    </div>
    <label
      for="layout-rightbar-drawer"
      class="btn btn-circle btn-ghost btn-sm drawer-button"
    >
      <span class="iconify lucide--settings-2 size-4.5"></span>
    </label>
    <div
      class="dropdown dropdown-bottom sm:dropdown-end max-sm:dropdown-center"
    >
      <div
        tabindex="0"
        role="button"
        class="btn btn-circle btn-ghost btn-sm"
        aria-label="Notifications"
      >
        <span class="iconify lucide--bell size-4.5"></span>
      </div>
      <div
        class="dropdown-content bg-base-100 rounded-box card card-compact mt-5 w-60 p-2 shadow sm:w-84"
      >
        <div class="flex items-center justify-between px-2">
          <p class="text-base font-medium">Notification</p>
          <button
            tabindex="0"
            class="btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
          >
            <span class="iconify lucide--x size-4"></span>
          </button>
        </div>
        <div class="flex items-center justify-center">
          <div class="badge badge-sm badge-primary badge-soft">Today</div>
        </div>
        <div class="mt-2">
          <div
            class="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all"
          >
            <img
              class="bg-base-200 mask mask-squircle size-10 p-0.5"
              alt=""
              src="./images/avatars/4.png"
            />
            <div class="grow">
              <p class="text-sm leading-tight">
                Customer has requested a return for item
              </p>
              <p class="text-base-content/60 text-end text-xs leading-tight">
                1 Hour ago
              </p>
            </div>
          </div>
          <div
            class="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all"
          >
            <img
              class="bg-base-200 mask mask-squircle size-10 p-0.5"
              alt=""
              src="./images/avatars/5.png"
            />
            <div class="grow">
              <p class="text-sm leading-tight">
                A new review has been submitted for product
              </p>
              <p class="text-base-content/60 text-end text-xs leading-tight">
                1 Hour ago
              </p>
            </div>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-center">
          <div class="badge badge-sm">Previous</div>
        </div>
        <div class="mt-2">
          <div
            class="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all"
          >
            <img
              class="bg-base-200 mask mask-squircle size-10 p-0.5"
              alt=""
              src="./images/avatars/1.png"
            />
            <div class="grow">
              <p class="text-sm leading-tight">
                Prepare for the upcoming weekend promotion
              </p>
              <p class="text-base-content/60 text-end text-xs leading-tight">
                2 Days ago
              </p>
            </div>
          </div>
          <div
            class="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all"
          >
            <img
              class="bg-base-200 mask mask-squircle size-10 p-0.5"
              alt=""
              src="./images/avatars/2.png"
            />
            <div class="grow">
              <p class="text-sm leading-tight">
                Product 'ABC123' is running low in stock.
              </p>
              <p class="text-base-content/60 text-end text-xs leading-tight">
                3 Days ago
              </p>
            </div>
          </div>
          <div
            class="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all"
          >
            <img
              class="bg-base-200 mask mask-squircle size-10 p-0.5"
              alt=""
              src="./images/avatars/3.png"
            />
            <div class="grow">
              <p class="text-sm leading-tight">
                Payment received for Order ID: #67890
              </p>
              <p class="text-base-content/60 text-end text-xs leading-tight">
                Week ago
              </p>
            </div>
          </div>
        </div>
        <hr class="border-base-300 -mx-2 mt-2" />
        <div class="flex items-center justify-between pt-2">
          <button class="btn btn-sm btn-ghost">Mark as read</button>
          <button class="btn btn-sm btn-soft btn-primary">View All</button>
        </div>
      </div>
    </div>
    <div class="dropdown dropdown-bottom dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost rounded-btn px-1.5">
        <div class="flex items-center gap-2">
          <div class="avatar">
            <div class="bg-base-200 mask mask-squircle w-8">
              <img alt="Avatar" src="./images/avatars/1.png" />
            </div>
          </div>
          <div class="-space-y-0.5 text-start">
            <p class="text-sm">Denish</p>
            <p class="text-base-content/60 text-xs">Profile</p>
          </div>
        </div>
      </div>
      <div class="dropdown-content bg-base-100 rounded-box mt-4 w-44 shadow">
        <ul class="menu w-full p-2">
          <li>
            <a href="/pages-settings.html">
              <span class="iconify lucide--user size-4"></span>
              <span>My Profile</span>
            </a>
          </li>
          <li>
            <a href="/pages-settings.html">
              <span class="iconify lucide--settings size-4"></span>
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a href="/pages-get-help.html">
              <span class="iconify lucide--help-circle size-4"></span>
              <span>Help</span>
            </a>
          </li>
        </ul>
        <hr class="border-base-300" />
        <ul class="menu w-full p-2">
          <li>
            <div>
              <span class="iconify lucide--arrow-left-right size-4"></span>
              <span>Switch Account</span>
            </div>
          </li>
          <li>
            <a class="text-error hover:bg-error/10" href="/auth/login">
              <span class="iconify lucide--log-out size-4"></span>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
