export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand-dark',
      secondary: 'brand-accent',
      neutral: 'slate'
    },
    button: {
      variants: {
        solid: {
          secondary: 'bg-{color}-500 dark:bg-{color}-500 text-brand-dark-950 dark:text-brand-dark-950 hover:bg-{color}-600 dark:hover:bg-{color}-600'
        }
      },

      compoundVariants: [
        {
          color: 'secondary',
          variant: 'solid',
          class: 'text-brand-dark-500 bg-secondary hover:bg-secondary/75 active:bg-secondary/75 disabled:bg-secondary aria-disabled:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'
        }
      ],
    },
    card: {
      slots: {
        header: 'sm:p-3 p-3',
        body: 'sm:p-3 p-3'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring ring-default divide-y-0'
          },
        }
      },
    }
  }
})
