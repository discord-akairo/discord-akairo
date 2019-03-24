# ClientUtil

### Finding Things

ClientUtil is a class filled with utility methods.  
It is available on your client as `client.util`.  

There are three "groups" of resolver methods for finding or checking Discord-related things.  
They allow you to, for example, find a user named `1Computer` from an input of `comp`.  

- `resolve <thing>`
    - e.g. `resolveUser`, `resolveChannel`, etc.
    - Finds an Discord-related object from a collection of those objects.

- `resolve <things>`
    - e.g. `resolveUsers`, `resolveChannels`, etc.
    - Filters Discord-related objects from a collection of those objects.

- `check <thing>`
    - e.g. `checkUser`, `checkChannel`, etc.
    - Used for the above methods, checks if a string could be referring to the object.

### Other Methods

There are a bunch of other things you may find useful:  

- `embed`, `attachment`, and `collection`
    - Shortcuts for MessageEmbed, MessageAttachment, and Collection.
- `resolvePermissionNumber`
    - Converts a permission number to an array of permission names.
