<script lang="ts">
	interface Props {
		size?: string;
		[key: string]: unknown;
	}

	let { size = '1em', ...rest }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	{...rest}
>
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M11.9993 19.9993C16.4176 19.9993 19.9993 16.4176 19.9993 11.9993C19.9993 7.58107 16.4176 3.99935 11.9993 3.99935C7.58107 3.99935 3.99935 7.58107 3.99935 11.9993C3.99935 16.4176 7.58107 19.9993 11.9993 19.9993ZM11.9993 21.3327C17.154 21.3327 21.3327 17.154 21.3327 11.9993C21.3327 6.84469 17.154 2.66602 11.9993 2.66602C6.84469 2.66602 2.66602 6.84469 2.66602 11.9993C2.66602 17.154 6.84469 21.3327 11.9993 21.3327Z"
		fill="currentColor"
	/>
	<path d="M7.99935 7.99935H10.666V15.9993H7.99935V7.99935Z" fill="currentColor" />
	<path d="M13.3327 7.99935H15.9993V13.3327H13.3327V7.99935Z" fill="currentColor" />
	<path d="M10.666 13.3327H13.3327V15.9993H10.666V13.3327Z" fill="currentColor" />
</svg>
